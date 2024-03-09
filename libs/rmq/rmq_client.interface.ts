import { IAmqpConnectionManager } from "amqp-connection-manager/dist/types/AmqpConnectionManager";
import { ExchangeType, IMessageBrocker } from "./message_brocker";
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { ConsumeMessage } from "amqplib";
import { Injectable } from "@nestjs/common";

export interface IRMQService {
    connect(url: string[], queues: string[]): Promise<ChannelWrapper>
    sendMessage<T>(channel: ChannelWrapper, queue: string, messageInfo: IMessageBrocker<T>): Promise<boolean>
    sendMessageAndWaitResponse<T>(channel: ChannelWrapper, queue: string, replyToQueue: string, messageInfo: IMessageBrocker<T>): Promise<boolean>
    listenMessage(channel: ChannelWrapper, queue: string, messageType?: string): Promise<ConsumeMessage>
    publishMessage<T>(channel: ChannelWrapper, messageInfo: IMessageBrocker<T>): Promise<boolean>
    subscribeToMessage(channel: ChannelWrapper, messageInfo: IMessageBrocker<any>, fromQueue: string): Promise<ConsumeMessage | undefined>
}

@Injectable()
export class RMQService implements IRMQService {
    static InjectName = "RMQ_SERVICE"
    async connect(url: string[], queues: string[]): Promise<ChannelWrapper> {
        try {
            const connection = amqp.connect(url);
            const channel = await connection.createChannel({
                setup: (channel: Channel) => {
                    queues.forEach(async queue => {
                        await channel.assertQueue(queue, { durable: true });
                    });
                },
            });
            return channel;
        } catch (ex) {
            console.log("RMQ connection exceptioin", ex)
        }
    }
    async sendMessage<T>(channel: ChannelWrapper, queue: string, messageInfo: IMessageBrocker<T>): Promise<boolean> {
        try {
            var sendResult = await channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageInfo.data)), {
                correlationId: messageInfo.coorelationId,
                expiration: messageInfo.expirationInSecond,
                persistent: messageInfo.persistMessage
            });
            return sendResult;
        } catch (ex) {
            console.log("send message exception", ex)
        }
    }
    async sendMessageAndWaitResponse<T>(channel: ChannelWrapper, queue: string, replyToQueue: string, messageInfo: IMessageBrocker<T>): Promise<boolean> {
        try {
            var sendResult = await channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageInfo.data)), {
                correlationId: messageInfo.coorelationId,
                replyTo: replyToQueue,
                expiration: messageInfo.expirationInSecond,

            });
            return sendResult;

        } catch (ex) {

        }
    }
    async listenMessage(channel: ChannelWrapper, queue: string, messageType?: string): Promise<ConsumeMessage> {
        return new Promise(async (resolve: (value: ConsumeMessage) => void, reject: (error: Error) => void) => {
            channel.consume(queue, (response) => {
                console.log("listen request reply", queue, messageType, response.content.toString(), response.properties)
                if (messageType != undefined) {
                    if (response.properties.correlationId == messageType) {
                        resolve(response);
                    }
                }
                else {
                    resolve(response);
                }
            })
        })
    }
    async publishMessage<T>(channel: ChannelWrapper, messageInfo: IMessageBrocker<T>): Promise<boolean> {
        try {
            await channel.assertExchange(messageInfo.exchange, messageInfo.exchangeType, { durable: false });
            var result = await channel.publish(messageInfo.exchange, messageInfo.routingKey, Buffer.from(JSON.stringify(messageInfo.data)))
            setTimeout(() => {
                channel.close();
            }, 500);
            return result;

        } catch (error) {

        }
    }
    async subscribeToMessage(channel: ChannelWrapper, messageInfo: Partial<IMessageBrocker<any>>, fromQueue: string): Promise<ConsumeMessage | undefined> {
        try {
            channel.assertExchange(messageInfo.exchange, messageInfo.exchangeType, { durable: false })
            const queue = await channel.assertQueue(fromQueue, { exclusive: true });
            await channel.bindQueue(queue.queue, messageInfo.exchange, messageInfo.routingKey);
            return new Promise((resolve: (value: ConsumeMessage) => void, reject: (error: Error) => void) => {

                channel.consume(
                    queue.queue,
                    (msg) => {
                        resolve(msg)
                    },
                    { noAck: true },
                );
            })
        } catch (error) {
        }
    }

}