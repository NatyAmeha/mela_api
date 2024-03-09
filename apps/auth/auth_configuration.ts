import { AppMsgQueues } from "libs/rmq/constants";

export const configuration = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432
    },
    auth: {
        acessToken: process.env.ACCESS_TOKEN || "DEFAULTACCESSTOKEN",
        refreshToken: process.env.REFRESH_TOKEN || "DEFAULT_REFRESH_TOKEN",
        accessTokenExpiresIn: "1d",
        refreshTokenExpiresIn: "7d"
    },
    rmq: {
        rmq_config: {
            url: ["amqp://guest:guest@127.0.0.1:5672"],
            queue: AppMsgQueues.AUTH_SERVICE_QUEUE,
            requestQueue: AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE,
            replyQueue: AppMsgQueues.AUTH_SERVICE_REPLY_QUEUE,
            noAck: false,
            prefetchCount: 1,
            queueOptions: {
                durable: false,
            }
        },
        client_name: AUTH_RMQ_CLIENT,
    }
});

export const ACCESS_TOKEN = 'auth.acessToken';
export const REFRESH_TOKEN = "auth.refreshToken";
export const ACCESS_TOKEN_EXPIRES_IN = "auth.accessTokenExpiresIn";
export const REFRESH_TOKEN_EXPIRES_IN = "auth.refreshTokenExpiresIn";

export const AUTH_RMQ_CLIENT = "AUTH_RMQ_CLIENT";

