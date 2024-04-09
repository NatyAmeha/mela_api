import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { CoreServiceMessageType, SubscriptionServiceMessageType } from "libs/rmq/app_message_type";
import { AppMsgQueues, ExchangeNames, ExchangeTopics, RoutingKey } from "libs/rmq/constants";
import { ExchangeType, IMessageBrocker, MessageBrockerMsgBuilder } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { BusinessService } from "../business/usecase/business.service";
import { SubscriptionResponse } from "apps/subscription/src/model/subscription.response";
import { Access } from "apps/auth/src/authorization/model/access.model";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";

import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { CoreServiceMessageProcessor } from "./core_service_msg_processor";


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
        let reply = await this.sendMessageGetReply<Access[], IMessageBrockerResponse>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo);
        return reply;
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
        this.rmqService.listenMessageBeta(this.channel, this.requestQueue).subscribe(async (messageResult) => {
            if (messageResult.properties.correlationId == CoreServiceMessageType.UPDATE_BUSINESS_REGISTRATION_STAGE) {
                console.log("Core service message received", messageResult.content.toString());
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