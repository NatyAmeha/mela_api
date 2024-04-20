import { Field, Int, ObjectType } from "@nestjs/graphql"
import { PlatfromServiceSubscription, Subscription } from "../subscription.model"
import { SubscriptionResponse } from "./subscription.response"
import { SubscriptionPlan } from "../subscription_plan.model"
import { PlatformService } from "../platform_service.model"
import { BaseResponse } from "@app/common/model/base.response"


@ObjectType()
export class SubscriptioinUpgradePriceingResponse extends BaseResponse {
    @Field(type => Int)
    price: number
    @Field(type => [PlatformService])
    addedPlatformServices?: PlatformService[]
    @Field(type => [PlatformService])
    removedPlatformServices?: PlatformService[]

    constructor(data: Partial<SubscriptioinUpgradePriceingResponse>) {
        super()
        Object.assign(this, data)
    }
}
export class SubscriptionResponseBuilder {
    private response: SubscriptionResponse
    constructor() {
        this.response = new SubscriptionResponse({})
    }

    withCreatedSubscription(subscription: Subscription) {
        this.response.success = true
        this.response.createdSubscription = subscription
        return this
    }

    withError(message: string) {
        this.response.success = false
        this.response.message = message
        return this
    }

    withSubscriptions(subscriptions: Subscription[]) {
        this.response.success = true
        this.response.subscriptions = subscriptions
        return this
    }

    withSubscriptionPlan(plan: SubscriptionPlan) {
        this.response.success = true
        this.response.plan = plan
        return this
    }

    withExistingActiveSubscriptions(subscriptions: Subscription[]) {
        this.response.success = true
        this.response.existingActiveSubscriptions = subscriptions
        return this
    }

    withDeletedSubscriptions(subscriptions: Subscription[]) {
        this.response.success = true
        this.response.deletedSubscritpions = subscriptions
        return this
    }

    withAddedPlatformServices(services: PlatfromServiceSubscription[]) {
        this.response.success = true
        this.response.addedPlatformServices = services
        return this
    }

    withExistingPlatformServices(services: PlatfromServiceSubscription[]) {
        this.response.success = true
        this.response.existingPlatformService = services
        return this
    }

    withPlatformServiceHavingFreeTrial(serviceIds: string[]) {
        this.response.success = true
        this.response.platformServicehavingFreeTrial = serviceIds
        return this
    }

    build() {
        return this.response
    }
}