import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Access } from "apps/auth/src/authorization/model/access.model";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { SubscriptionServiceMessageType } from "libs/rmq/app_message_type";
import { AppMsgQueues, ExchangeNames, RoutingKey } from "libs/rmq/constants";
import { IMessageBrocker } from "libs/rmq/message_brocker";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { SubscriptionResponse } from "./model/subscription.response";

export interface ISubscriptionMessageBrocker {
    createPlatformAccessPermission(access: Access[]): Promise<IMessageBrockerResponse<any>>
    sendSubscriptionCreatedEventToCoreService(): Promise<boolean>
}

@Injectable()
export class SubscriptionMessageBrocker extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy {
    static InjectName = "SUBSCRIPTION_MSG_BROCKER"
    constructor(@Inject(RMQService.InjectName) public rmqService: IRMQService, public configService: ConfigService) {
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

    async createPlatformAccessPermission(access: Access[]): Promise<IMessageBrockerResponse<any>> {
        var messageInfo = this.generateMessageInfoToCreateAccessPermission(access, AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE);
        var reply = await this.sendMessageGetReply<Access[], IMessageBrockerResponse<any>>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
        return reply;
    }

    async sendSubscriptionCreatedEventToCoreService(subscriptionResponse: SubscriptionResponse): Promise<boolean> {
        var messageInfo: IMessageBrocker<SubscriptionResponse> = {
            data: subscriptionResponse,
            coorelationId: SubscriptionServiceMessageType.SUBSCRIPTION_CREATED_EVENT,
            persistMessage: true,
        }
        var sendResult = await this.sendMessage(AppMsgQueues.CORE_SERVICE_REQUEST_QUEUE, messageInfo, "newId")
        return sendResult;
    }

    async listenSubscriptionRequestAndReply() {
        var messageResult = await this.rmqService.listenMessage(this.channel, this.requestQueue)
    }

    async listenSubscriptionServiceEvent() {
        var messageInfo: IMessageBrocker<any> = {
            routingKey: RoutingKey.SUBSCRIPTION_SERVICE_ROUTING_KEY,
            exchange: ExchangeNames.SUBSCRIPTION_DIRECT_EXCHANGE
        }
        var messageResult = await this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue).subscribe(async (messageResult) => {

        })

    }

    onModuleDestroy() {
        console.log("channel closed")
        this.channel.close()
    }


}