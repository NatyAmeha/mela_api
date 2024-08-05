import { Injectable, Scope } from "@nestjs/common";
import { BusinessService } from "../business/usecase/business.service";
import { IReceivedMessageProcessor } from "libs/rmq/app_message_processor.interface";
import { ConsumeMessage } from "amqplib";
import { CoreServiceMessageType, SubscriptionServiceMessageType } from "libs/rmq/const/app_message_type";
import { SubscriptionResponse } from "apps/subscription/src/model/response/subscription.response";
import { ChannelWrapper } from "amqp-connection-manager";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { ProductService } from "../product/usecase/product.service";

@Injectable({ scope: Scope.DEFAULT })
export class CoreServiceMessageProcessor implements IReceivedMessageProcessor {
    static InjectName = "CORE_SERVICE_MSG_PROCESSOR"
    processedMessageIds = new Set<string>();
    constructor(private businessService: BusinessService, private productService: ProductService) {

    }

    async processMessage(channel: ChannelWrapper, messageResult: ConsumeMessage): Promise<IMessageBrockerResponse<any>> {
        try {
            let canAckMessage = true;
            var messageId = messageResult.properties.messageId;
            let replyResponse: IMessageBrockerResponse<any> = { success: false }
            if (!this.processedMessageIds.has(messageId)) {
                this.processedMessageIds.add(messageId);
                let messageInfo = JSON.parse(messageResult.content.toString())
                if (messageResult.properties.correlationId == SubscriptionServiceMessageType.PLATFORM_SUBSCRIPTION_CREATED_EVENT) {
                    let subscriptionResponse = messageInfo as SubscriptionResponse
                    var businesResponse = await this.businessService.handleUpdateBusienssSubscriptionEvent(subscriptionResponse);
                    canAckMessage = businesResponse.isSafeErrorIfExist();
                    replyResponse = { success: true, data: businesResponse };
                }
                else if (messageResult.properties.correlationId == CoreServiceMessageType.GET_BUSINESS_INFO) {
                    let businessId = messageInfo as string;
                    let businessInfo = await this.businessService.getBusinessResponse(businessId);
                    canAckMessage = businessInfo.isSafeErrorIfExist()
                    replyResponse = { success: true, data: businessInfo };
                }
                else if (messageResult.properties.correlationId == SubscriptionServiceMessageType.PRODUCT_ASSIGNMENT_TO_MEMBERSHIP) {
                    const messageData = messageInfo.data as { membershipId: string, productIds: string[] }
                    const productAssignmentResult = await this.productService.adddMembershipIdToProducts(messageData.productIds, messageData.membershipId);
                    replyResponse = { success: true, data: productAssignmentResult };
                }
                else if (messageResult.properties.correlationId == SubscriptionServiceMessageType.GET_MEMBERSHIP_PRODUCTS) {
                    const membershipId = messageInfo as string;
                    const response = await this.productService.getMembershipProducts(membershipId);
                    replyResponse = { success: true, data: response.products ?? [] };
                }
            }
            if (canAckMessage) {
                channel.ack(messageResult)
                this.processedMessageIds.delete(messageId);
            }
            return replyResponse;
        } catch (ex) {
            console.log("error processing message", ex)
            return { success: false, message: ex };

        }
    }
}