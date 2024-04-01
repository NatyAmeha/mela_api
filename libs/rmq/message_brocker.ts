export interface IMessageBrocker<T> {
    data?: T,
    exchange?: string
    exchangeType?: ExchangeType
    routingKey?: string
    coorelationId?: string,
    replyCoorelationId?: string
    replyQueue?: string,  // to listen and filter message reply by id
    expirationInSecond?: number,
    persistMessage?: boolean
}

export enum ExchangeType {
    DIRECT = "direct", FANOUT = "fanout", PUB_SUB = "pubsub"
}