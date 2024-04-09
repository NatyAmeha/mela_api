import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { AuthorizationService } from "../authorization";
import { AuthServiceMessageType } from "libs/rmq/app_message_type";
import { Access } from "../authorization/model/access.model";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthMsgProcessosor implements IReceivedMessageProcessor {
    static InjectName = "AUTH_SERVICE_MSG_PROCESSOR"
    processedMessageIds = new Set<string>();
    constructor(private authorizationService: AuthorizationService) {

    }

    async processMessage(channel: ChannelWrapper, messageResult: ConsumeMessage): Promise<boolean> {
        try {
            let canAckMessage = true;
            let messageId = messageResult.properties.messageId;
            let replyResponse: IMessageBrockerResponse<any> = { success: false }

            if (!this.processedMessageIds.has(messageId)) {
                this.processedMessageIds.add(messageId);
                let messageContent = JSON.parse(messageResult.content.toString())

                if (messageResult.properties.correlationId == AuthServiceMessageType.CREATE_ACCESS_PERMISSION) {
                    let accesses = messageContent as Access[];
                    let createResult = await this.authorizationService.createAccess(accesses)
                    replyResponse.success = createResult.isSafeErrorIfExist();
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