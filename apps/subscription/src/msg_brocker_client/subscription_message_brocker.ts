import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Access, AccessOwnerType } from "apps/auth/src/authorization/model/access.model";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { AuthServiceMessageType, CoreServiceMessageType, MembershipMessageType, SubscriptionServiceMessageType } from "libs/rmq/const/app_message_type";
import { AppMsgQueues, ExchangeNames, ExchangeTopics, RoutingKey } from "libs/rmq/const/constants";
import { ExchangeType, IMessageBrocker, MessageBrockerMsgBuilder } from "libs/rmq/message_brocker";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { SubscriptionResponse } from "../model/response/subscription.response";
import { SubscriptionMsgProcessosor } from "./subscription_service_msg_processor";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { Subscription } from "rxjs";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { AccessQueryMetadata, AccessRenewalInfo as AccessRenewalInfo } from "apps/auth/src/authorization/model/revoke_access.metadata";
import { Business } from "apps/core/src/business/model/business.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { BusinessResponse } from "apps/core/src/business/model/business.response";
import { ProductResponse } from "apps/core/src/product/model/product.response";
import { MembershipType } from "../membership/model/memberhip.model";
import { MembershipProduct } from "../membership/model/membership_product.model";

export interface ISubscriptionMessageBrocker {
    createPlatformAccessPermission(access: Access[]): Promise<IMessageBrockerResponse<any>>
    sendSubscriptionCreatedEventToCoreService(): Promise<boolean>
}

@Injectable()
export class SubscriptionMessageBrocker extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy {
    static InjectName = "SUBSCRIPTION_MSG_BROCKER"
    eventMsgListenerSubscription?: Subscription;

    constructor(public configService: ConfigService,
        @Inject(RMQService.InjectName) public rmqService: IRMQService,
        @Inject(SubscriptionMsgProcessosor.InjectName) private subscriptionMessageProcessor: IReceivedMessageProcessor,
    ) {
        super(rmqService, configService)
    }

    async onModuleInit() {
        try {
            console.log("channel opened")
            await this.connectMessageBrocker();
            this.listenSubscriptionRequestAndReply();
            this.listenSubscriptionServiceEvent();
        } catch (ex) {
            console.log("subscription message brocker exception", ex)
        }
    }

    async createPlatformServiceAccessPermission(access: Access[]): Promise<IMessageBrockerResponse<any>> {
        let messageInfo = this.generateAccessMessageToSendToAuthService(access, AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE);
        let reply = await this.sendMessageGetReply<Access[], any>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
        return reply;
    }

    async getBusinessInformationFromCoreService(businessId: string): Promise<BusinessResponse> {
        const messageId = `${CoreServiceMessageType.GET_BUSINESS_INFO}-${businessId}`;
        let messageInfo = new MessageBrockerMsgBuilder<string>().withData(businessId).withReplyQueue(AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE).withMessageId(messageId).withCoorelationId(CoreServiceMessageType.GET_BUSINESS_INFO).build();
        let reply = await this.sendMessageGetReply<string, BusinessResponse>(AppMsgQueues.CORE_SERVICE_REQUEST_QUEUE, messageInfo)
        if (!reply.success || !reply.data) {
            throw new RequestValidationException({ message: "Error occured, please try again later" })
        }
        return reply.data as BusinessResponse
    }

    async sendSubscriptionCreatedEventToServices(subscriptionResponse: SubscriptionResponse,): Promise<boolean> {
        let sendResult = await this.publishMessageByTopic(subscriptionResponse, ExchangeTopics.EVENT_TOPIC, SubscriptionServiceMessageType.PLATFORM_SUBSCRIPTION_CREATED_EVENT, { messageId: subscriptionResponse.subscription.id })
        return sendResult;
    }

    async sendProductAssignedToMembershipEvent(membershipId: string, productIds: string[]): Promise<boolean> {
        const messageId = `${SubscriptionServiceMessageType.PRODUCT_ASSIGNMENT_TO_MEMBERSHIP}-${membershipId}`;
        const messageInfo = new MessageBrockerMsgBuilder<{ membershipId: string, productIds: string[] }>().withData({ membershipId, productIds }).withMessageId(messageId).withCoorelationId(SubscriptionServiceMessageType.PRODUCT_ASSIGNMENT_TO_MEMBERSHIP).build();
        let sendResult = await this.sendMessage(AppMsgQueues.CORE_SERVICE_REQUEST_QUEUE, messageInfo, messageId);
        return sendResult;
    }

    async getMembershipProductsFromCoreService(membershipId: string): Promise<MembershipProduct[]> {
        const messageId = `${MembershipMessageType.GET_MEMBERSHIP_PRODUCTS}-${membershipId}`;
        let messageInfo = new MessageBrockerMsgBuilder<string>().withData(membershipId).withReplyQueue(AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE).withMessageId(messageId).withCoorelationId(MembershipMessageType.GET_MEMBERSHIP_PRODUCTS).build();
        let reply = await this.sendMessageGetReply<string, MembershipProduct[]>(AppMsgQueues.CORE_SERVICE_REQUEST_QUEUE, messageInfo)
        if (!reply.success) {
            throw new RequestValidationException({ message: "Error occured, please try again later" })
        }
        return MembershipProduct.getMembershipProductsfromRawProductDataInput(reply.data);
    }

    async listenSubscriptionRequestAndReply() {
        this.rmqService.listenMessageBeta(this.channel, this.requestQueue).subscribe(async (incommingMessage) => {
            console.log("Reply message received in Subscription service", incommingMessage.content.toString());
            let replyResponse: IMessageBrockerResponse<any> = { success: false }
            let replyCoorelationId = incommingMessage.properties.correlationId;
            let msgResult = await this.subscriptionMessageProcessor.processMessage(this.channel, incommingMessage)

            await this.sendMessage(incommingMessage.properties.replyTo, msgResult, replyCoorelationId)
        })
    }

    async listenSubscriptionServiceEvent() {
        let messageInfo = new MessageBrockerMsgBuilder().withExchange(ExchangeTopics.EVENT_TOPIC, ExchangeType.TOPIC).withRoutingKey(ExchangeTopics.EVENT_TOPIC).build();
        this.eventMsgListenerSubscription = await this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue).subscribe(async (messageResult) => {
            console.log("event received in subscription service", messageResult.content.toString());
            let result = await this.subscriptionMessageProcessor.processMessage(this.channel, messageResult)
        })
    }

    onModuleDestroy() {
        console.log("channel closed")
        this.channel.close()
        this.eventMsgListenerSubscription?.unsubscribe();
    }


}