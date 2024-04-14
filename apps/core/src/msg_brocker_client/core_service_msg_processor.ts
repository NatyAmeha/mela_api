import { Injectable, Scope } from "@nestjs/common";
import { BusinessService } from "../business/usecase/business.service";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { ConsumeMessage } from "amqplib";
import { SubscriptionServiceMessageType } from "libs/rmq/app_message_type";
import { SubscriptionResponse } from "apps/subscription/src/model/subscription.response";
import { ChannelWrapper } from "amqp-connection-manager";

@Injectable({ scope: Scope.DEFAULT })
export class CoreServiceMessageProcessor implements IReceivedMessageProcessor {
    static InjectName = "CORE_SERVICE_MSG_PROCESSOR"
    processedMessageIds = new Set<string>();
    constructor(private businessService: BusinessService) {

    }

    async processMessage(channel: ChannelWrapper, messageResult: ConsumeMessage): Promise<boolean> {
        try {
            let canAckMessage = true;
            var messageId = messageResult.properties.messageId;
            if (!this.processedMessageIds.has(messageId)) {
                this.processedMessageIds.add(messageId);
                let messageInfo = JSON.parse(messageResult.content.toString())
                if (messageResult.properties.correlationId == SubscriptionServiceMessageType.PLATFORM_SUBSCRIPTION_CREATED_EVENT) {
                    let subscriptionResponse = messageInfo as SubscriptionResponse
                    var businesResponse = await this.businessService.handleUpdateBusienssSubscriptionEvent(subscriptionResponse);
                    canAckMessage = businesResponse.isSafeErrorIfExist();
                }
            }
            if (canAckMessage) {
                channel.ack(messageResult)
                this.processedMessageIds.delete(messageId);
            }
            return canAckMessage;
        } catch (ex) {
            console.log("error processing message", ex)
            return false;

        }
    }
}