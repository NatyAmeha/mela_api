import { AppMsgQueues } from "libs/rmq/const/constants";

export const orderServiceConfiguration = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432
    },

    rmq: {
        rmq_config: {  // host.docker.internal
            url: "amqp://localhost:5672",
            queue: AppMsgQueues.ORDER_SERVICE_EVENT_QUEUE,
            requestQueue: AppMsgQueues.ORDER_SERVICE_REQUEST_QUEUE,
            replyQueue: AppMsgQueues.ORDER_SERVICE_REPLY_QUEUE,
            noAck: false,
            prefetchCount: 1,
            queueOptions: {
                durable: false,
            }
        },
        client_name: CORE_RMQ_CLIENT,
    }
});

export const CORE_RMQ_CLIENT = "ORDER_SERVICE_RMQ_CLIENT";