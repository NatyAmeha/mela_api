import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { AuthServiceMessageType } from "libs/rmq/app_message_type";
import { ExchangeNames, ExchangeTopics, RoutingKey } from "libs/rmq/constants";
import { ExchangeType, IMessageBrocker } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { AuthorizationService } from "./authorization";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { Access } from "../prisma/generated/prisma_auth_client";

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
            this.respondToMessage(messageResult)
        })
    }

    async listenAuthEvents() {

        var messageInfo: IMessageBrocker<any> = {
            routingKey: ExchangeTopics.EVENT_TOPIC,
            exchange: ExchangeTopics.EVENT_TOPIC,
            exchangeType: ExchangeType.TOPIC,
        }
        var messageResult = await this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue).subscribe(async (messageResult) => {
            console.log("event received in Auth service", messageResult.properties.messageId);
            console.log("event received in Auth service", messageResult.content.toString());
        })
    }

    async respondToMessage(messageInfo: ConsumeMessage) {
        var replyResponse: IMessageBrockerResponse<any> = { success: false }
        var replyCoorelationId = messageInfo.properties.correlationId;
        try {
            var messageContent = JSON.parse(messageInfo.content.toString())
            if (messageInfo.properties.correlationId == AuthServiceMessageType.CREATE_ACCESS_PERMISSION) {
                let accesses = messageContent as Access[];
                let createResult = await this.authorizationService.createAccess(accesses)
                replyResponse.success = createResult.success;
            }
        } catch (error) {

        }
        finally {
            // if (replyResponse.success) { }
            this.channel.ack(messageInfo);
            var sendResult = await this.sendMessage(messageInfo.properties.replyTo, replyResponse, replyCoorelationId)
        }
    }


    onModuleDestroy() {
        console.log("channel closed")
        this.channel.close();
    }


}