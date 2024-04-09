import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";

export interface IReceivedMessageProcessor {
    processMessage(channel: ChannelWrapper, messageResult: ConsumeMessage): Promise<boolean>
}