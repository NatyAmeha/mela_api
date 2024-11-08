import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChannelWrapper } from "amqp-connection-manager";
import { Access, AccessOwnerType } from "apps/auth/src/authorization/model/access.model";
import { AppMsgQueues, ExchangeNames, RoutingKey } from "libs/rmq/const/constants";
import { ExchangeType, IMessageBrocker, MessageBrockerMsgBuilder } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { AuthServiceMessageType } from "./const/app_message_type";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { AccessQueryMetadata, AccessRenewalInfo } from "apps/auth/src/authorization/model/revoke_access.metadata";
import { IMessageBrockerResponse, MessageBrockerResponseBuilder } from "./message_brocker.response";
import { Observable, map } from "rxjs";

export interface IAppMessageBrocker {
    connectMessageBrocker(): Promise<void>
    sendMessage<T, K>(queue: string, message: T, messageId: string): Promise<boolean>
    sendMessageGetReply<T, K>(queue: string, messageInfo: IMessageBrocker<T>, waitForInSecond: number): Promise<IMessageBrockerResponse<K>>
    publishMessageByTopic<T>(message: T, topic: string, coorelationId: string, options: { messageId?: string, routingKey: string }): Promise<boolean>
    // common message brocker methods
    generateAccessMessageToSendToAuthService(access: Access[], replyQueue: string): IMessageBrocker<Access[]>
}

@Injectable()
export class AppMessageBrocker implements IAppMessageBrocker {
    constructor(public rmqService: IRMQService, public configService: ConfigService) { }

    channel: ChannelWrapper
    eventQueue: string = "";
    requestQueue: string = "";
    replyQueue: string = "";



    async connectMessageBrocker() {
        let rmqUrl = this.configService.get<string>("rmq.rmq_config.url")
        this.eventQueue = this.configService.get<string>("rmq.rmq_config.queue")
        this.requestQueue = this.configService.get<string>("rmq.rmq_config.requestQueue")
        this.replyQueue = this.configService.get<string>("rmq.rmq_config.replyQueue")
        await this.rmqService.connect([rmqUrl])
        this.channel = await this.rmqService.createChannel([this.eventQueue, this.requestQueue, this.replyQueue])

    }

    async sendMessage<T, K>(queue: string, message: T, messageId: string): Promise<boolean> {
        try {
            this.channel = await this.rmqService.createChannel([this.eventQueue, this.requestQueue, this.replyQueue])
            let messageInfo: IMessageBrocker<T> = {
                data: message,
                coorelationId: messageId,
            }
            let sendResult = await this.rmqService.sendMessage(this.channel, queue, messageInfo)
            return sendResult;
        } catch (ex) {
            console.log("error occured while sending message")
        } finally {
            // await this.channel.close();
        }
    }



    async sendMessageGetReply<T, K>(queue: string, messageInfo: IMessageBrocker<T>, waitForInSecond: number = 10): Promise<IMessageBrockerResponse<K>> {
        const timeoutPromise = new Promise<IMessageBrockerResponse<K>>((resolve, reject) => {
            setTimeout(() => {
                const replyFaiedResponse = MessageBrockerResponseBuilder.create(false, "Unable to get response from related services, please try again later").build()
                resolve(replyFaiedResponse);
            }, waitForInSecond * 1000);
        });

        const operationPromise = (async () => {
            try {
                this.channel = await this.rmqService.createChannel([this.requestQueue])
                await this.rmqService.sendMessageAndWaitResponse(this.channel, queue, messageInfo)
                let reply = await this.rmqService.listenMessage(this.channel, messageInfo.replyQueue, messageInfo.coorelationId)
                if (reply?.content) {
                    console.log('message content ', reply.content.toString())
                    let response = reply.content.toString()
                    this.channel.ack(reply)
                    return JSON.parse(response) as IMessageBrockerResponse<K>
                }
                return undefined;
            } catch (error) {

                console.log("error occured while sending message and waiting response")
            } finally {
                // await this.channel.close();
            }
        })();
        return Promise.race([operationPromise, timeoutPromise]);
    }

    async publishMessageByTopic<T>(message: T, topic: string, coorelationId: string, options: { messageId?: string, routingKey?: string }): Promise<boolean> {
        try {
            this.channel = await this.rmqService.createChannel([this.eventQueue])
            let messageInfo: IMessageBrocker<T> = {
                data: message,
                routingKey: options.routingKey,
                exchange: topic,
                messageId: options.messageId,
                coorelationId: coorelationId,
                exchangeType: ExchangeType.TOPIC,
            }
            let sendResult = await this.rmqService.publishMessage(this.channel, messageInfo)
            return sendResult;
        } catch (ex) {
            console.log("error occured while sending message")
        } finally {
            // await this.channel.close();
        }
    }

    generateAccessMessageToSendToAuthService(accesses: Access[], replyQueue: string): IMessageBrocker<Access[]> {
        let messageInfo: IMessageBrocker<Access[]> = {
            data: accesses,
            coorelationId: AuthServiceMessageType.CREATE_ACCESS_PERMISSION,
            replyQueue: replyQueue,
            persistMessage: true,
        }
        return messageInfo;
    }

    async sendAccessRenewalMessageToAuthService(businessId: string, newBusinessAccess: Access[]): Promise<IMessageBrockerResponse<any>> {
        // revoke previous access message
        var revokeAccessCommand = new AccessQueryMetadata({ ownerId: businessId, ownerType: AccessOwnerType.BUSINESS, permissionType: PermissionType.PLATFORM_SERVICE_ACCESS_PERMISSION })
        var messageContent: AccessRenewalInfo = { newAccesses: newBusinessAccess, revokeAccessCommand: revokeAccessCommand }
        let messageId = `${businessId}-${AuthServiceMessageType.REVOKE_PREVIOUS_PLATFORM_ACCESS_PERMISSION_AND_CREATE_NEW_ACCESS}`
        let messageInfo = new MessageBrockerMsgBuilder().withData(messageContent).withReplyQueue(AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE).withCoorelationId(AuthServiceMessageType.REVOKE_PREVIOUS_PLATFORM_ACCESS_PERMISSION_AND_CREATE_NEW_ACCESS).withMessageId(messageId).build()
        let reply = await this.sendMessageGetReply<any, AccessRenewalInfo>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
        return reply;
    }

    async sendAccessRevokeMessageToAuthService(revokeAccessMetadata: AccessQueryMetadata, correlationId: string, messageId: string): Promise<boolean> {
        let revokePlatformServiceMessage = new MessageBrockerMsgBuilder().withData(revokeAccessMetadata).withCoorelationId(correlationId).withMessageId(messageId).build();
        let result = await this.sendMessage(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, revokePlatformServiceMessage, correlationId)
        return result;
    }



}