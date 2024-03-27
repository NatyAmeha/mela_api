import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConsumeMessage } from "amqplib";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { AuthServiceMessageType, CoreServiceMessageType } from "libs/rmq/app_message_type";
import { AppMsgQueues, ExchangeNames, RoutingKey } from "libs/rmq/constants";
import { IMessageBrocker } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";
import { BusinessService } from "./business/usecase/business.service";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { Business } from "../prisma/generated/prisma_auth_client";
import { Access } from "apps/auth/src/authorization/model/access.model";


export interface ICoreServiceMsgBrocker {
    createMessageForAuthServiceToCreateAccess(access: Access[]): IMessageBrocker<Access[]>
}

@Injectable()
export class CoreServiceMsgBrockerClient extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy, ICoreServiceMsgBrocker {
    static InjectName = "AUTH_MSG_BROCKER"
    constructor(@Inject(RMQService.InjectName) public rmqService: IRMQService, public configService: ConfigService, private businessService: BusinessService) {
        super(rmqService, configService)
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
                await this.updateBusinessRegistrationStage(messageResult, CoreServiceMessageType.UPDATE_BUSINESS_REGISTRATION_STAGE)
            }

        })
    }

    async listenCoreServiceEvent() {
        var messageInfo: IMessageBrocker<any> = {
            routingKey: RoutingKey.CORE_SERVICE_ROUTING_KEY,
            exchange: ExchangeNames.CORE_DIRECT_EXCHANGE
        }
        var messageResult = await this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue)
        var data = messageResult.content.toString();
        if (data) {
        }
    }

    createMessageForAuthServiceToCreateAccess(access: Access[]): IMessageBrocker<Access[]> {
        var messageInfo: IMessageBrocker<Access[]> = {
            data: access,
            coorelationId: AuthServiceMessageType.CREATE_ACCESS_PERMISSION,
            replyQueue: AppMsgQueues.CORE_SERVICE_REPLY_QUEUE,
            expirationInSecond: 60 * 1,
            persistMessage: true,
        }
        return messageInfo;
    }

    async updateBusinessRegistrationStage(messageInfo: ConsumeMessage, coorelationId: string) {
        let businessInfo = JSON.parse(messageInfo.content.toString()) as Business
        var result = await this.businessService.updateBusienssRegistrationStage(businessInfo.id, businessInfo.stage);
        var messageResult: IMessageBrockerResponse;
        if (result) {
            messageResult = {
                success: true
            }
        }
        else {
            messageResult = {
                success: false,
            }
        }
        var sendResult = await this.sendMessage(messageInfo.properties.replyTo, messageResult, coorelationId)
        this.channel.ack(messageInfo)
    }


    onModuleDestroy() {
        console.log("channel closed")
        this.channel.close();
    }


}