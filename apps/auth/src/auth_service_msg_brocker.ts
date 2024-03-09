import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { AuthServiceMessageType } from "libs/rmq/app_message_type";
import { ExchangeNames, RoutingKey } from "libs/rmq/constants";
import { IMessageBrocker } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";

export interface IAuthServiceMsgBrocker {

}

@Injectable()
export class AuthServiceMsgBrocker extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy, IAuthServiceMsgBrocker {
    static InjectName = "AUTH_MSG_BROCKER"
    constructor(@Inject(RMQService.InjectName) public rmqService: IRMQService, public configService: ConfigService) {
        super(rmqService, configService)
    }

    async onModuleInit() {
        try {
            await this.connectMessageBrocker();
            this.listenAuthServiceRequestAndReply()
            this.listenAuthEvents();

        } catch (ex) {
            console.log("subscription message brocker exception", ex)
        }
    }

    async listenAuthServiceRequestAndReply() {
        var messageResult = await this.rmqService.listenMessage(this.channel, this.requestQueue)
        if (messageResult.properties.correlationId == AuthServiceMessageType.REQUEST_AUTH_USER) {
            await this.replyToSubscritpionPlanCreated(messageResult, 33445566, AuthServiceMessageType.REQUEST_AUTH_USER)
        }
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

    async replyToSubscritpionPlanCreated(messageInfo: ConsumeMessage, message: number, coorelationId: string) {
        var sendResult = await this.sendMessage(messageInfo.properties.replyTo, message, coorelationId)
        if (sendResult) {
            this.channel.ack(messageInfo)
        }
    }


    onModuleDestroy() {
        this.channel.close();
    }


}