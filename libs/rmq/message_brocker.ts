export interface IMessageBrocker<T> {
    data?: T,
    exchange?: string
    exchangeType?: ExchangeType
    routingKey?: string
    coorelationId?: string,
    replyQueue?: string,
    expirationInSecond?: number,
    persistMessage?: boolean
}

export enum ExchangeType {
    DIRECT = "direct", FANOUT = "fanout", PUB_SUB = "pubsub"
}