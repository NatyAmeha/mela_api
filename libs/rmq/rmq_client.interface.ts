import { IAmqpConnectionManager } from "amqp-connection-manager/dist/types/AmqpConnectionManager";
import { ExchangeType, IMessageBrocker } from "./message_brocker";
import amqp, { Channel, ChannelWrapper } from 'amqp-connection-manager';
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { ConsumeMessage } from "amqplib";
import { Injectable } from "@nestjs/common";
import { Observable, from, switchMap } from "rxjs";
import { ExchangeNames, ExchangeTopics } from "./const/constants";

export interface IRMQService {
    connect(url: string[]): Promise<IAmqpConnectionManager>
    createChannel(queues: string[]): Promise<ChannelWrapper>
    sendMessage<T>(channel: ChannelWrapper, queue: string, messageInfo: IMessageBrocker<T>): Promise<boolean>
    sendMessageAndWaitResponse<T>(channel: ChannelWrapper, queue: string, messageInfo: IMessageBrocker<T>): Promise<boolean>
    listenMessage(channel: ChannelWrapper, queue: string, messageType?: string): Promise<ConsumeMessage>
    listenMessageBeta(channel: ChannelWrapper, queue: string, messageType?: string): Observable<ConsumeMessage>
    publishMessage<T>(channel: ChannelWrapper, messageInfo: IMessageBrocker<T>): Promise<boolean>
    subscribeToMessage(channel: ChannelWrapper, messageInfo: IMessageBrocker<any>, fromQueue: string): Observable<ConsumeMessage>
}

@Injectable()
export class RMQService implements IRMQService {
    connection: IAmqpConnectionManager;
    static InjectName = "RMQ_SERVICE"
    async connect(url: string[]): Promise<IAmqpConnectionManager> {
        try {
            this.connection = amqp.connect(url);
            return this.connection;
        } catch (ex) {
            console.log("RMQ connection exceptioin", ex)
        }
    }
    async createChannel(queues: string[]): Promise<ChannelWrapper> {
        try {
            const channel = await this.connection.createChannel({
                setup: async (channel: Channel) => {
                    await Promise.all(queues.map(async queue => {
                        await channel.assertQueue(queue, { durable: true });


                    }));
                    await channel.assertExchange(ExchangeTopics.EVENT_TOPIC, ExchangeType.TOPIC, { durable: true });
                    await channel.bindQueue(queues[0], ExchangeTopics.EVENT_TOPIC, "event.#");

                },
            });
            channel.on('close', () => {
                console.error('Channel closed, attempting to reconnect...');
                // reconnect();
            });

            channel.on('error', (err) => {
                console.error('Channel error:', err);
            });

            this.connection.on('error', (err) => {
                console.error('Connection error:', err);
            });

            this.connection.on('close', () => {
                console.error('Connection closed, attempting to reconnect...');
                // reconnect();
            });
            return channel;
        } catch (ex) {
            console.log("create channel exception", ex)
        }
    }
    async sendMessage<T>(channel: ChannelWrapper, queue: string, messageInfo: IMessageBrocker<T>): Promise<boolean> {
        try {
            var sendResult = await channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageInfo.data)), {
                correlationId: messageInfo.coorelationId,
                // expiration: messageInfo.expirationInSecond,
            });
            return sendResult;
        } catch (ex) {
            console.log("send message exception", ex)
        }
    }
    async sendMessageAndWaitResponse<T>(channel: ChannelWrapper, queue: string, messageInfo: IMessageBrocker<T>): Promise<boolean> {
        try {
            var sendResult = await channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageInfo.data)), {
                correlationId: messageInfo.coorelationId,
                replyTo: messageInfo.replyQueue,
                expiration: messageInfo.expirationInSecond
            });
            return sendResult;

        } catch (ex) {
            console.log("send message wait response exception", ex)
        }
    }
    async listenMessage(channel: ChannelWrapper, queue: string, messageType?: string): Promise<ConsumeMessage> {
        return new Promise(async (resolve: (value: ConsumeMessage) => void, reject: (error: Error) => void) => {
            channel.consume(queue, (response) => {
                console.log("listen request reply", queue, messageType, response.content.toString(), response.properties)
                if (messageType != undefined) {
                    if (response.properties.correlationId == messageType) {
                        // channel.ack(response)
                        resolve(response);
                    }
                }
                else {
                    resolve(response);
                }
            }, { noAck: true })
        })
    }

    listenMessageBeta(channel: ChannelWrapper, queue: string, messageType?: string): Observable<ConsumeMessage> {
        return new Observable(observer => {
            channel.consume(queue, (response) => {
                try {
                    if (messageType != undefined) {
                        observer.next(response)
                        // if (response.properties.correlationId == messageType) {
                        // } 
                    }
                    else {
                        observer.next(response)
                    }
                    channel.ack(response);
                } catch (error) {
                    console.log("listen message beta", error)
                }
            }, { noAck: true })
        })

    }
    async publishMessage<T>(channel: ChannelWrapper, messageInfo: IMessageBrocker<T>): Promise<boolean> {
        try {
            await channel.assertExchange(messageInfo.exchange, messageInfo.exchangeType, { durable: true });
            var result = await channel.publish(messageInfo.exchange, messageInfo.routingKey, Buffer.from(JSON.stringify(messageInfo.data)), {
                messageId: messageInfo.messageId,
                correlationId: messageInfo.coorelationId
            });
            return result;

        } catch (error) {
            console.log("publish message error", error)
        }
    }


    subscribeToMessage(channel: ChannelWrapper, messageInfo: Partial<IMessageBrocker<any>>, fromQueue: string): Observable<ConsumeMessage> {
        try {
            console.log("subscribe message", messageInfo.exchange, messageInfo.exchangeType)
            return from(
                channel.assertExchange(messageInfo.exchange, messageInfo.exchangeType, { durable: false })
            ).pipe(
                switchMap(() => channel.assertQueue(fromQueue, { exclusive: true })),
                switchMap(queue => {
                    // channel.bindQueue(queue.queue, messageInfo.exchange, "*");
                    return new Observable<ConsumeMessage>(observer => {
                        channel.consume(
                            queue.queue,
                            (msg) => {
                                observer.next(msg)
                            }, { noAck: true }
                        );
                    });
                })
            );


        } catch (error) {
            console.log("subscribe message error", error)
        }
    }

}