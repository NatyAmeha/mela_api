import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { AuthServiceMessageType } from "libs/rmq/app_message_type";
import { ExchangeNames, RoutingKey } from "libs/rmq/constants";
import { IMessageBrocker } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { AuthorizationService } from "./authorization";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";

export interface IAuthServiceMsgBrocker {

}

@Injectable()
export class AuthServiceMsgBrocker extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy, IAuthServiceMsgBrocker {
    static InjectName = "AUTH_MSG_BROCKER"
    constructor(@Inject(RMQService.InjectName) public rmqService: IRMQService, public configService: ConfigService, private authorizationService: AuthorizationService) {
        super(rmqService, configService)
    }

    async onModuleInit() {
        try {
            console.log("channel opened")
            await this.connectMessageBrocker();
            this.listenAuthServiceRequestAndReply()
            this.listenAuthEvents();

        } catch (ex) {
            console.log("subscription message brocker exception", ex)
        }
    }

    async listenAuthServiceRequestAndReply() {
        this.rmqService.listenMessageBeta(this.channel, this.requestQueue).subscribe(async (messageResult) => {
            if (messageResult.properties.correlationId == AuthServiceMessageType.CREATE_PLATFORM_ACCESS_PERMISSION) {
                console.log("message received from subscription")
                await this.createPlatformAccessandReply(messageResult, AuthServiceMessageType.CREATE_PLATFORM_ACCESS_PERMISSION)
            }
            else {
                console.log("default message received")
                var sendResult = await this.sendMessage(messageResult.properties.replyTo, messageResult, AuthServiceMessageType.CREATE_PLATFORM_ACCESS_PERMISSION)
            }
        })

    }

    async listenAuthEvents() {
        var messageInfo: IMessageBrocker<any> = {
            routingKey: RoutingKey.AUTH_SERVICE_ROUTING_KEY,
            exchange: ExchangeNames.AUTH_DIRECT_EXCHANGE
        }
        var messageResult = await this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue)
        var data = messageResult.content.toString();
        if (data) {
        }
    }

    async createPlatformAccessandReply(messageInfo: ConsumeMessage, coorelationId: string) {
        let subscriptionMessage = JSON.parse(messageInfo.content.toString()) as Subscription;
        var subscriptionInfo = new Subscription({ ...subscriptionMessage })
        let createResult = await this.authorizationService.createPlatformServiceAccessPermissionForBusinesses(subscriptionInfo)
        let messageResult: IMessageBrockerResponse<any> = {
            success: createResult
        }
        var sendResult = await this.sendMessage(messageInfo.properties.replyTo, messageResult, coorelationId)
        this.channel.ack(messageInfo)
    }


    onModuleDestroy() {
        console.log("channel closed")
        this.channel.close();
    }


}