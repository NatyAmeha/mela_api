import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { AuthorizationService } from "../authorization";
import { AuthServiceMessageType } from "libs/rmq/const/app_message_type";
import { Access } from "../authorization/model/access.model";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { Injectable } from "@nestjs/common";
import { AccessQueryMetadata, AccessRenewalInfo } from "../authorization/model/revoke_access.metadata";
import { AccessResponse } from "../authorization/model/acces.response";

@Injectable()
export class AuthMsgProcessosor implements IReceivedMessageProcessor {
    static InjectName = "AUTH_SERVICE_MSG_PROCESSOR"
    processedMessageIds = new Set<string>();
    constructor(private authorizationService: AuthorizationService) {

    }

    async processMessage(channel: ChannelWrapper, messageResult: ConsumeMessage): Promise<IMessageBrockerResponse<any>> {
        try {
            let canAckMessage = true;
            let messageId = messageResult.properties.messageId;
            let replyResponse: IMessageBrockerResponse<any> = { success: false }

            if (!this.processedMessageIds.has(messageId)) {
                this.processedMessageIds.add(messageId);
                let messageContent = JSON.parse(messageResult.content.toString())

                if (messageResult.properties.correlationId == AuthServiceMessageType.CREATE_ACCESS_PERMISSION) {
                    let accesses = messageContent as Access[];
                    let accessCreateResult = await this.authorizationService.createAccess(accesses)
                    replyResponse.success = accessCreateResult.isSafeErrorIfExist();
                    replyResponse.data = accessCreateResult
                }

                else if (messageResult.properties.correlationId == AuthServiceMessageType.REVOKE_PLATFORM_ACCESS_PERMISSION_FROM_BUSINESS) {
                    let revokeAccessMetadata = messageContent as AccessQueryMetadata
                    let accessRevokeResult = await this.authorizationService.revokeAccesses(revokeAccessMetadata)
                    replyResponse.success = accessRevokeResult.isSafeErrorIfExist();
                    replyResponse.data = accessRevokeResult
                }
                else if (messageResult.properties.correlationId == AuthServiceMessageType.REVOKE_PREVIOUS_PLATFORM_ACCESS_PERMISSION_AND_CREATE_NEW_ACCESS) {
                    let accessRenewalInfo = messageContent as AccessRenewalInfo
                    let revokeResult = await this.authorizationService.revokeAccesses(accessRenewalInfo.revokeAccessCommand)
                    let createResult = await this.authorizationService.createAccess(accessRenewalInfo.newAccesses);
                    replyResponse.success = createResult.isSafeErrorIfExist() && revokeResult.isSafeErrorIfExist();
                    replyResponse.data = <AccessResponse>{ deleteAccessCount: revokeResult.deleteAccessCount, accesses: createResult.accesses }
                }
            }
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