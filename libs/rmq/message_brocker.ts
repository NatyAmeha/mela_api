export interface IMessageBrocker<T> {
    data?: T,
    exchange?: string
    exchangeType?: ExchangeType
    routingKey?: string
    coorelationId?: string,
    messageId?: string
    replyCoorelationId?: string
    replyQueue?: string,  // to listen and filter message reply by id
    expirationInSecond?: number,
    persistMessage?: boolean
}

export enum ExchangeType {
    DIRECT = "direct", FANOUT = "fanout", TOPIC = "topic"
}