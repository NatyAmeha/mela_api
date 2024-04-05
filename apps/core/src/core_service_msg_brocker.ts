import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { CoreServiceMessageType, SubscriptionServiceMessageType } from "libs/rmq/app_message_type";
import { AppMsgQueues, ExchangeNames, RoutingKey } from "libs/rmq/constants";
import { IMessageBrocker } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { BusinessService } from "./business/usecase/business.service";
import { SubscriptionResponse } from "apps/subscription/src/model/subscription.response";
import { Access } from "apps/auth/src/authorization/model/access.model";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";


export interface ICoreServiceMsgBrocker {
    sendCreateAccessPermissionMessage(accessList: Access[]): Promise<IMessageBrockerResponse>
}

@Injectable()
export class CoreServiceMsgBrockerClient extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy, ICoreServiceMsgBrocker {
    static InjectName = "AUTH_MSG_BROCKER"
    constructor(@Inject(RMQService.InjectName) public rmqService: IRMQService, public configService: ConfigService, private businessService: BusinessService) {
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
        var messageInfo: IMessageBrocker<any> = {
            routingKey: RoutingKey.CORE_SERVICE_ROUTING_KEY,
            exchange: ExchangeNames.CORE_DIRECT_EXCHANGE
        }
        this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue).subscribe(async (messageResult) => {
            let messageInfo = JSON.parse(messageResult.content.toString())
            this.channel.ack(messageInfo)
            if (messageResult.properties.correlationId == SubscriptionServiceMessageType.SUBSCRIPTION_CREATED_EVENT) {
                console.log("Subscription message received", messageResult.content.toString());
                let subscriptionResponse = messageInfo as SubscriptionResponse
                await this.businessService.updateBusienssRegistrationToPaymentStage(subscriptionResponse);
            }
        })
    }


    onModuleDestroy() {
        console.log("channel closed")
        this.channel.close();
    }


}