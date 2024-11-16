import { AppMsgQueues } from "libs/rmq/const/constants";

export const Configuration = () => ({
    auth: {
        accessToken: process.env.ACCESS_TOKEN || "DEFAULTACCESSTOKEN",
        refreshToken: process.env.REFRESH_TOKEN || "DEFAULT_REFRESH_TOKEN",
        accessTokenExpiresIn: "1d",
        refreshTokenExpiresIn: "7d",
        userAccessEndpointFromAuthService: (authServiceEndpoint: string, userId: string) => {
            return `${authServiceEndpoint}/access/user?id=${userId}`;
        },
        businessAccessFetchEndpoint: (coreServiceEndpoint: string, businessId: string) => {
            return `${coreServiceEndpoint}/access/business?id=${businessId}`;
        },
        businessSubscriptionEndpoint: (subscriptionServiceEndpoint: string, businessId: string) => {
            return `${subscriptionServiceEndpoint}/subscription/business?id=${businessId}`
        }

    },

});

