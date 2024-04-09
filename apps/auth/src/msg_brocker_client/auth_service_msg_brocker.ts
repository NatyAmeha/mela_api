import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { AuthServiceMessageType } from "libs/rmq/app_message_type";
import { ExchangeNames, ExchangeTopics, RoutingKey } from "libs/rmq/constants";
import { ExchangeType, IMessageBrocker } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { AuthorizationService } from "../authorization";

import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { Access } from "../../prisma/generated/prisma_auth_client";
import { AuthMsgProcessosor } from "./auth_msg_processor";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { Subscription } from "rxjs";

export interface IAuthServiceMsgBrocker {

}

@Injectable()
export class AuthServiceMsgBrocker extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy, IAuthServiceMsgBrocker {
    static InjectName = "AUTH_MSG_BROCKER"
    eventMsgListenerSubscription?: Subscription;

    constructor(@Inject(RMQService.InjectName) public rmqService: IRMQService, public configService: ConfigService,
        @Inject(AuthMsgProcessosor.InjectName) private authMessageProcessor: IReceivedMessageProcessor,) {
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
            let replyResponse: IMessageBrockerResponse<any> = { success: false }
            let replyCoorelationId = messageResult.properties.correlationId;
            replyResponse.success = await this.authMessageProcessor.processMessage(this.channel, messageResult)
            await this.sendMessage(messageResult.properties.replyTo, replyResponse, replyCoorelationId)
        })
    }

    async listenAuthEvents() {
        let messageInfo: IMessageBrocker<any> = {
            routingKey: ExchangeTopics.EVENT_TOPIC,
            exchange: ExchangeTopics.EVENT_TOPIC,
            exchangeType: ExchangeType.TOPIC,
        }
        this.eventMsgListenerSubscription = await this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue).subscribe(async (messageResult) => {
            console.log("event received in Auth service", messageResult.content.toString());
            await this.authMessageProcessor.processMessage(this.channel, messageResult)
        })
    }


    onModuleDestroy() {
        console.log("channel closed")
        this.eventMsgListenerSubscription?.unsubscribe();
        this.channel.close();

    }


}