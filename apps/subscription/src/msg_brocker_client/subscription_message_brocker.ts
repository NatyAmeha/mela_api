import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Access } from "apps/auth/src/authorization/model/access.model";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { SubscriptionServiceMessageType } from "libs/rmq/app_message_type";
import { AppMsgQueues, ExchangeNames, ExchangeTopics, RoutingKey } from "libs/rmq/constants";
import { ExchangeType, IMessageBrocker } from "libs/rmq/message_brocker";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { SubscriptionResponse } from "../model/subscription.response";
import { SubscriptionMsgProcessosor } from "./subscription_service_msg_processor";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { Subscription } from "rxjs";

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

    async sendPlatformAccessPermissionMessagetoAuthService(access: Access[]): Promise<IMessageBrockerResponse<any>> {
        let messageInfo = this.generateAccessMessageToSendToAuthService(access, AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE);
        let reply = await this.sendMessageGetReply<Access[], IMessageBrockerResponse<any>>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
        return reply;
    }

    async sendSubscriptionCreatedEventToServices(subscriptionResponse: SubscriptionResponse,): Promise<boolean> {
        let sendResult = await this.publishMessageByTopic(subscriptionResponse, ExchangeTopics.EVENT_TOPIC, SubscriptionServiceMessageType.PLATFORM_SUBSCRIPTION_CREATED_EVENT, { messageId: subscriptionResponse.createdSubscription.id })
        return sendResult;
    }

    async listenSubscriptionRequestAndReply() {
        let messageResult = await this.rmqService.listenMessage(this.channel, this.requestQueue)
    }

    async listenSubscriptionServiceEvent() {
        let messageInfo: IMessageBrocker<any> = {
            routingKey: "*",
            exchange: ExchangeTopics.EVENT_TOPIC,
            exchangeType: ExchangeType.TOPIC,
        }
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