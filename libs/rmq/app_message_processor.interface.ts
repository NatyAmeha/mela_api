import { ChannelWrapper } from "amqp-connection-manager";
import { ConsumeMessage } from "amqplib";
import { IMessageBrockerResponse } from "./message_brocker.response";

export interface IReceivedMessageProcessor {
    processMessage<T>(channel: ChannelWrapper, messageResult: ConsumeMessage): Promise<IMessageBrockerResponse<T>>
}