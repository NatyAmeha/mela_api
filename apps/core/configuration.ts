import { AppMsgQueues } from "libs/rmq/constants";

export const configuration = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432
    },

    rmq: {
        rmq_config: {  // host.docker.internal
            url: "amqp://localhost:5672",
            queue: AppMsgQueues.CORE_SERVICE_QUEUE,
            requestQueue: AppMsgQueues.CORE_SERVICE_REQUEST_QUEUE,
            replyQueue: AppMsgQueues.CORE_SERVICE_REPLY_QUEUE,
            noAck: false,
            prefetchCount: 1,
            queueOptions: {
                durable: false,
            }
        },
        client_name: CORE_RMQ_CLIENT,
    }
});

export const CORE_RMQ_CLIENT = "AUTH_RMQ_CLIENT";