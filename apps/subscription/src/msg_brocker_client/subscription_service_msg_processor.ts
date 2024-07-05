import { Inject, Injectable } from "@nestjs/common";
import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";

import { AuthServiceMessageType, SubscriptionServiceMessageType } from "libs/rmq/const/app_message_type";

import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { SubscriptionService } from "../usecase/subscription.usecase";
import { IPlatformServiceRepo, PlatformServiceRepository } from "../repo/platform_service.repo";

@Injectable()
export class SubscriptionMsgProcessosor implements IReceivedMessageProcessor {
    static InjectName = "SUBSCRIPTION_SERVICE_MSG_PROCESSOR"
    processedMessageIds = new Set<string>();
    constructor(private subscriptionService: SubscriptionService, private platformServiceRepo: PlatformServiceRepository) {

    }

    async processMessage<T>(channel: ChannelWrapper, messageResult: ConsumeMessage): Promise<IMessageBrockerResponse<T>> {
        try {
            let canAckMessage = true;
            let messageId = messageResult.properties.messageId;
            let replyResponse: IMessageBrockerResponse<any> = { success: false }

            if (!this.processedMessageIds.has(messageId)) {
                this.processedMessageIds.add(messageId);
                let messageContent = JSON.parse(messageResult.content.toString())
                if (messageResult.properties.correlationId == SubscriptionServiceMessageType.GET_BUSINESS_SUBSCRIPTION_WITH_ALL_PLATFORM_SERVICES) {
                    let businessId = messageContent as string;
                    let platformSErvice = await this.platformServiceRepo.getAllPlatformServices()
                    let subscritpionResult = await this.subscriptionService.getBusinessSubscription(businessId)
                    subscritpionResult.platformServices = platformSErvice;

                    canAckMessage = subscritpionResult.isSafeErrorIfExist();
                    replyResponse = { success: true, data: subscritpionResult };
                }
            }
            console.log("can ack message", canAckMessage)
            if (canAckMessage) {
                channel.ack(messageResult)
                this.processedMessageIds.delete(messageId);
            }
            return replyResponse;
        } catch (ex) {
            console.log("error processing message", ex)
            return { success: false };

        }
    }
}