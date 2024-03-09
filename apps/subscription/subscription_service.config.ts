import { AppMsgQueues } from "libs/rmq/constants";

export const Subscriptionconfiguration = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10) || 5435
    },
    rmq: {
        rmq_config: {
            url: "amqp://guest:guest@127.0.0.1:5672",
            queue: AppMsgQueues.SUBSCRITPION_SERVICE_QUEUE,
            requestQueue: AppMsgQueues.SUBSCRIPTION_SERVICE_REQUEST_QUEUE,
            replyQueue: AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE,
            noAck: false,
            prefetchCount: 1,
            queueOptions: {
                durable: false,
            }
        },
        client_name: RMQ_CLIENT,
    }

});

export const RMQ_CLIENT = "SUBSCRIPTION_RMQ";



