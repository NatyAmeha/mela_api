import { createParamDecorator } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "apps/auth/src/auth/model/user.model";
import { PlatformServiceGateway, SubscriptionGateway } from "apps/mela_api/src/model/subscription.gateway.model";

export class AuthorizationHelper {
    static UserHeaderKey = "user";
    static SubscriptionHeaderKey = "subscription";
    static PlatformServicesHeaderKey = "platformServices"

    static getPlatformServicesFromRequest(request: any): PlatformServiceGateway[] {
        let subscriptionHeaderValue = request.headers.platformServices ?? "";
        if (subscriptionHeaderValue && subscriptionHeaderValue !== "undefined") {
            let platformServiceInfo = JSON.parse(subscriptionHeaderValue) as PlatformServiceGateway[];
            if (platformServiceInfo != undefined) {
                return platformServiceInfo
            }
            return undefined
        }
    }
}

export const CurrentUser = createParamDecorator((data: any, context: GqlExecutionContext) => {
    let gqlContext = GqlExecutionContext.create(context)
    let request = gqlContext.getContext().req;
    let userHeaderValue = request.headers.user ?? "";
    if (userHeaderValue && userHeaderValue !== "undefined") {
        let userInfo = JSON.parse(userHeaderValue) as User;
        if (userInfo.id != undefined) {
            return userInfo
        }
        return undefined

    }
})

export const PlatformServiceSubscription = createParamDecorator((data: any, context: GqlExecutionContext) => {
    let gqlContext = GqlExecutionContext.create(context)
    let request = gqlContext.getContext().req;
    let subscriptionHeaderValue = request.headers.subscription ?? "";
    if (subscriptionHeaderValue && subscriptionHeaderValue !== "undefined") {
        let subscriptionInfo = JSON.parse(subscriptionHeaderValue) as SubscriptionGateway;
        if (subscriptionInfo.id != undefined) {
            return subscriptionInfo
        }
        return undefined
    }
})

export const PlatformServices = createParamDecorator((data: any, context: GqlExecutionContext) => {
    let gqlContext = GqlExecutionContext.create(context)
    let request = gqlContext.getContext().req;
    let platofrmServices = AuthorizationHelper.getPlatformServicesFromRequest(request)
    return PlatformServices
})