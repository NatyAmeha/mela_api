import { Injectable } from "@nestjs/common";
import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";

import { AuthServiceMessageType } from "libs/rmq/app_message_type";

import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";

@Injectable()
export class SubscriptionMsgProcessosor implements IReceivedMessageProcessor {
    static InjectName = "SUBSCRIPTION_SERVICE_MSG_PROCESSOR"
    processedMessageIds = new Set<string>();
    constructor() {

    }

    async processMessage(channel: ChannelWrapper, messageResult: ConsumeMessage): Promise<boolean> {
        try {
            let canAckMessage = true;
            let messageId = messageResult.properties.messageId;
            let replyResponse: IMessageBrockerResponse<any> = { success: false }

            if (!this.processedMessageIds.has(messageId)) {
                this.processedMessageIds.add(messageId);
                let messageContent = JSON.parse(messageResult.content.toString())
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