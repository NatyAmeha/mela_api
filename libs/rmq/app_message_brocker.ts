import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChannelWrapper } from "amqp-connection-manager";
import { Access } from "apps/auth/src/authorization/model/access.model";
import { ExchangeNames, RoutingKey } from "libs/rmq/constants";
import { IMessageBrocker } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { AuthServiceMessageType } from "./app_message_type";

export interface IAppMessageBrocker {
    connectMessageBrocker(): Promise<void>
    sendMessage<T, K>(queue: string, message: T, messageId: string): Promise<boolean>
    sendMessageGetReply<T, K>(queue: string, message: T, messageId: string, replyQueue: string): Promise<K>

    // common message brocker methods
    generateAccessMessageToSendToAuthService(access: Access[], replyQueue: string): IMessageBrocker<Access[]>
}

@Injectable()
export class AppMessageBrocker implements IAppMessageBrocker {
    constructor(public rmqService: IRMQService, public configService: ConfigService) { }

    channel: ChannelWrapper
    eventQueue: string = "";
    requestQueue: string = "";
    replyQueue: string = ""


    async connectMessageBrocker() {
        var rmqUrl = this.configService.get<string>("rmq.rmq_config.url")
        this.eventQueue = this.configService.get<string>("rmq.rmq_config.queue")
        this.requestQueue = this.configService.get<string>("rmq.rmq_config.requestQueue")
        this.replyQueue = this.configService.get<string>("rmq.rmq_config.replyQueue")
        this.channel = await this.rmqService.connect([rmqUrl], [this.eventQueue, this.requestQueue, this.replyQueue])
    }

    async sendMessage<T, K>(queue: string, message: T, messageId: string): Promise<boolean> {
        var messageInfo: IMessageBrocker<T> = {
            data: message,
            coorelationId: messageId,
        }
        var sendResult = await this.rmqService.sendMessage(this.channel, queue, messageInfo)
        return sendResult;
    }


    async sendMessageGetReply<T, K>(queue: string, messageInfo: IMessageBrocker<T>): Promise<K> {
        try {
            await this.connectMessageBrocker()
            var sendResult = await this.rmqService.sendMessageAndWaitResponse(this.channel, queue, messageInfo.replyQueue, messageInfo)
            var reply = await this.rmqService.listenMessage(this.channel, messageInfo.replyQueue, messageInfo.coorelationId)
            if (reply?.content) {
                var response = reply.content.toString()
                this.channel.ack(reply)
                return JSON.parse(response) as K
            }
            return undefined;
        } catch (error) {
            console.log("error occured while sending message and waiting response")
        } finally {
            await this.channel.close();
        }
    }

    generateAccessMessageToSendToAuthService(accesses: Access[], replyQueue: string): IMessageBrocker<Access[]> {
        var messageInfo: IMessageBrocker<Access[]> = {
            data: accesses,
            coorelationId: AuthServiceMessageType.CREATE_ACCESS_PERMISSION,
            replyQueue: replyQueue,
            expirationInSecond: 60 * 1,
            persistMessage: true,
        }
        return messageInfo;
    }



}