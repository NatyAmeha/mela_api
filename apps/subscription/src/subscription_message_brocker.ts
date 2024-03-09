import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppMessageBrocker } from "libs/rmq/app_message_brocker";
import { ExchangeNames, RoutingKey } from "libs/rmq/constants";
import { IMessageBrocker } from "libs/rmq/message_brocker";
import { IRMQService, RMQService } from "libs/rmq/rmq_client.interface";

export interface ISubscriptionMessageBrocker {
}

@Injectable()
export class SubscriptionMessageBrocker extends AppMessageBrocker implements OnModuleInit, OnModuleDestroy {
    static InjectName = "SUBSCRIPTION_MSG_BROCKER"
    constructor(@Inject(RMQService.InjectName) public rmqService: IRMQService, public configService: ConfigService) {
        super(rmqService, configService)
    }

    async onModuleInit() {
        try {
            await this.connectMessageBrocker();
            this.listenSubscriptionRequestAndReply();
            this.listenSubscriptionServiceEvent();
        } catch (ex) {
            console.log("subscription message brocker exception", ex)
        }
    }

    async listenSubscriptionRequestAndReply() {
        var messageResult = await this.rmqService.listenMessage(this.channel, this.requestQueue)
    }

    async listenSubscriptionServiceEvent() {
        var messageInfo: IMessageBrocker<any> = {
            routingKey: RoutingKey.SUBSCRIPTION_SERVICE_ROUTING_KEY,
            exchange: ExchangeNames.SUBSCRIPTION_DIRECT_EXCHANGE
        }
        var messageResult = await this.rmqService.subscribeToMessage(this.channel, messageInfo, this.eventQueue)
        if (messageResult.content) {
            if (messageResult.properties.correlationId == "newId") {

            }
        }
    }

    onModuleDestroy() {
    }


}