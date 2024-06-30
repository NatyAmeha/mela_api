export interface IMessageBrocker<T> {
    data?: T,
    exchange?: string
    exchangeType?: ExchangeType
    routingKey?: string
    coorelationId?: string,
    messageId?: string
    replyCoorelationId?: string
    replyQueue?: string,  // to listen and filter message reply by id
    expirationInSecond?: string,
    persistMessage?: boolean
}

export class MessageBrockerMsgBuilder<T> {
    private messageInfo: IMessageBrocker<T> = {}
    withData(data: T): MessageBrockerMsgBuilder<T> {
        this.messageInfo.data = data;
        return this;
    }
    withExchange(exchange: string, exchangeType?: ExchangeType): MessageBrockerMsgBuilder<T> {
        this.messageInfo.exchange = exchange;
        this.messageInfo.exchangeType = exchangeType;
        return this;
    }

    withRoutingKey(routingKey: string): MessageBrockerMsgBuilder<T> {
        this.messageInfo.routingKey = routingKey;
        return this;
    }
    withCoorelationId(coorelationId: string): MessageBrockerMsgBuilder<T> {
        this.messageInfo.coorelationId = coorelationId;
        return this;
    }
    withMessageId(messageId: string): MessageBrockerMsgBuilder<T> {
        this.messageInfo.messageId = messageId;
        return this;
    }
    withReplyCoorelationId(replyCoorelationId: string): MessageBrockerMsgBuilder<T> {
        this.messageInfo.replyCoorelationId = replyCoorelationId;
        return this;
    }
    withReplyQueue(replyQueue: string): MessageBrockerMsgBuilder<T> {
        this.messageInfo.replyQueue = replyQueue;
        return this;
    }
    withExpiration(expirationInSecond: string): MessageBrockerMsgBuilder<T> {
        this.messageInfo.expirationInSecond = expirationInSecond;
        return this;
    }
    withPersistMessage(persistMessage: boolean): MessageBrockerMsgBuilder<T> {
        this.messageInfo.persistMessage = persistMessage;
        return this;
    }
    build(): IMessageBrocker<T> {
        return this.messageInfo;
    }

}

export enum ExchangeType {
    DIRECT = "direct", FANOUT = "fanout", TOPIC = "topic"
}