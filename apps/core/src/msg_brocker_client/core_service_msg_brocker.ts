import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { AuthServiceMessageType, CoreServiceMessageType, DEFAULT_REPLY_RESPONSE_TIMEOUT, MembershipMessageType, SubscriptionServiceMessageType } from "libs/rmq/const/app_message_type";
import { AppMsgQueues, ExchangeNames, ExchangeTopics, RoutingKey } from "libs/rmq/const/constants";
import { ExchangeType, IMessageBrocker, MessageBrockerMsgBuilder } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { BusinessService } from "../business/usecase/business.service";
import { SubscriptionResponse } from "apps/subscription/src/model/response/subscription.response";
import { Access } from "apps/auth/src/authorization/model/access.model";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";

import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { CoreServiceMessageProcessor } from "./core_service_msg_processor";
import { BusinessMembership } from "../business/model/business_memership.model";
import { User } from "apps/auth/src/auth/model/user.model";
import { AuthResponse } from "apps/auth/src/auth/model/auth.response";
import { CreateStaffInput } from "../staff/dto/staff.input";


export interface ICoreServiceMsgBrocker {
    sendCreateAccessPermissionMessage(accessList: Access[]): Promise<IMessageBrockerResponse>
}

@Injectable()
export class CoreServiceMsgBrockerClient extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy, ICoreServiceMsgBrocker {
    static InjectName = "AUTH_MSG_BROCKER"

    constructor(@Inject(RMQService.InjectName) public rmqService: IRMQService, public configService: ConfigService,
        @Inject(CoreServiceMessageProcessor.InjectName) private messageProcessor: IReceivedMessageProcessor,) {
        super(rmqService, configService)
    }
    async sendCreateAccessPermissionMessage(accessList: Access[]): Promise<IMessageBrockerResponse> {
        let messageInfo = this.generateAccessMessageToSendToAuthService(accessList, AppMsgQueues.CORE_SERVICE_REPLY_QUEUE);
        let reply = await this.sendMessageGetReply<Access[], any>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo);
        return reply;
    }

    async sendCreateStaffUserAndAccessMessage(staffInput: CreateStaffInput) {
        let staffInfo = CreateStaffInput.toStaff(staffInput);
        let accesses = staffInfo.createDefaultStaffAccess();
        let StaffUserInfo = new User({ ...staffInfo.toUser(), accesses: accesses });
        let messageInfo: IMessageBrocker<User> = {
            data: StaffUserInfo,
            coorelationId: AuthServiceMessageType.CREATE_STAFF_USER_AND_ASSIGN_ACCESS,
            replyQueue: AppMsgQueues.CORE_SERVICE_REPLY_QUEUE,
            persistMessage: true,
        }
        let reply = await this.sendMessageGetReply<User, AuthResponse>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo);
        return reply;
    }

    async getBusinessSubscription(businessId: string): Promise<IMessageBrockerResponse<SubscriptionResponse>> {
        let messageInfo = new MessageBrockerMsgBuilder<string>().withData(businessId)
            .withReplyQueue(AppMsgQueues.CORE_SERVICE_REPLY_QUEUE)
            .withMessageId(`${SubscriptionServiceMessageType.GET_BUSINESS_SUBSCRIPTION_WITH_ALL_PLATFORM_SERVICES}-${businessId}`)
            .withCoorelationId(SubscriptionServiceMessageType.GET_BUSINESS_SUBSCRIPTION_WITH_ALL_PLATFORM_SERVICES)
            .withExpiration(DEFAULT_REPLY_RESPONSE_TIMEOUT)
            .build();
        let reply = await this.sendMessageGetReply<string, SubscriptionResponse>(AppMsgQueues.SUBSCRIPTION_SERVICE_REQUEST_QUEUE, messageInfo);
        return reply;
    }

    async getBusinessMembershipsFromMembershipService(businessId: string): Promise<BusinessMembership[]> {
        let messageInfo = new MessageBrockerMsgBuilder<string>().withData(businessId)
            .withReplyQueue(AppMsgQueues.CORE_SERVICE_REPLY_QUEUE)
            .withMessageId(`${MembershipMessageType.GET_BUSINESS_MEMBERSHIPS}-${businessId}`)
            .withCoorelationId(MembershipMessageType.GET_BUSINESS_MEMBERSHIPS)
            .withExpiration(DEFAULT_REPLY_RESPONSE_TIMEOUT)
            .build();
        let reply = await this.sendMessageGetReply<string, BusinessMembership[]>(AppMsgQueues.SUBSCRIPTION_SERVICE_REQUEST_QUEUE, messageInfo);
        return BusinessMembership.fromRawMembershipInfo(reply.data);
    }

    async onModuleInit() {
        try {
            console.log("channel opened")
            await this.connectMessageBrocker();
            this.listenCoreServiceRequestAndReply()
            this.listenCoreServiceEvent();

        } catch (ex) {
            console.log("subscription message brocker exception", ex)
        }
    }

    async listenCoreServiceRequestAndReply() {
        var messageINfo = new MessageBrockerMsgBuilder().withExchange(ExchangeNames.CORE_DIRECT_EXCHANGE, ExchangeType.DIRECT).withRoutingKey(RoutingKey.CORE_SERVICE_ROUTING_KEY).build();
        this.rmqService.listenMessageBeta(this.channel, this.requestQueue).subscribe(async (message) => {
            console.log("Reply message received in Core service", message.content.toString());
            let replyCoorelationId = message.properties.correlationId;
            let msgProcessResult = await this.messageProcessor.processMessage(this.channel, message)
            if (message.properties.replyTo) {
                await this.sendMessage(message.properties.replyTo, msgProcessResult, replyCoorelationId)
            }
        })
    }

    async listenCoreServiceEvent() {
        let messageInfo = new MessageBrockerMsgBuilder().withExchange(ExchangeTopics.EVENT_TOPIC, ExchangeType.TOPIC).withRoutingKey(ExchangeTopics.EVENT_TOPIC).build();
        this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue).subscribe(async (messageResult) => {
            console.log("event received in Core service", messageResult.properties.messageId);
            await this.messageProcessor.processMessage(this.channel, messageResult)
        })
    }


    onModuleDestroy() {
        console.log("channel closed")
        this.channel.close();
    }


}