import { AppMsgQueues } from "libs/rmq/constants";

export const Configuration = () => ({
    auth: {
        accessToken: process.env.ACCESS_TOKEN || "DEFAULTACCESSTOKEN",
        refreshToken: process.env.REFRESH_TOKEN || "DEFAULT_REFRESH_TOKEN",
        accessTokenExpiresIn: "1d",
        refreshTokenExpiresIn: "7d",
        userAccessEndpointFromAuthService: (userId: string) => {
            return `http://localhost:3002/access/user?id=${userId}`;
        },
        businessAccessFetchEndpoint: (businessId: string) => {
            return `http://localhost:3002/access/business?id=${businessId}`;
        }
    },

});

