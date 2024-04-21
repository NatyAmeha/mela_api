import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PlatfromServiceSubscription, Subscription } from "../subscription.model";
import { SubscriptionPlan } from "../subscription_plan.model";
import { BaseResponse } from "@app/common/model/base.response";
import { PlatformService } from "../platform_service.model";

@ObjectType()
export class SubscriptionResponse extends BaseResponse {
    @Field(type => Subscription, { description: "subscription info created" })
    subscription?: Subscription;
    @Field(type => SubscriptionPlan, { description: "Subscription plan info that is subscribed" })
    plan?: SubscriptionPlan
    @Field(type => [Subscription], { description: "subscriptions" })
    subscriptions?: Subscription[]
    @Field(type => [Subscription], { description: "existing subscription available for requested by planId and owner" })
    existingActiveSubscriptions?: Subscription[]
    @Field(type => [Subscription])
    deletedSubscritpions?: Subscription[]
    @Field(type => [PlatfromServiceSubscription])
    addedPlatformServices?: PlatfromServiceSubscription[]
    @Field(type => [PlatfromServiceSubscription])
    existingPlatformService?: PlatfromServiceSubscription[]

    @Field(type => [PlatformService])
    platformServices?: PlatformService[]

    @Field(type => [String])
    platformServicehavingFreeTrial?: string[]

    constructor(data: Partial<SubscriptionResponse>) {
        super()
        Object.assign(this, data)
    }

    changeSubscritpioStatus(status: boolean) {
        this.subscription.isActive = status;
    }

    setPlatformServicesHavingFreetrial(servicesInsideSubscription: PlatfromServiceSubscription[]) {
        let servicesHavingFreeTrial = servicesInsideSubscription.filter(service => service.isTrialPeriod)
    }

    isSafeErrorIfExist(): boolean {
        if (this.success == true) {
            return true
        }
        if (this.message) {
            switch (this.message) {
                default:
                    return false;
            }
        }
        return false;
    }
}

export class SubscriptionResponseBuilder {
    private response: SubscriptionResponse
    constructor() {
        this.response = new SubscriptionResponse({})
    }

    withSubscription(subscription: Subscription) {
        this.response.success = true
        this.response.subscription = subscription
        return this
    }

    withError(message: string) {
        this.response.success = false
        this.response.message = message
        return this
    }

    withPlatformServices(platformServices: PlatformService[]) {
        this.response.success = true
        this.response.platformServices = platformServices
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

    withAddedPlatformServices(platformServices: PlatfromServiceSubscription[]) {
        this.response.success = true
        this.response.addedPlatformServices = platformServices
        return this
    }

    withExistingPlatformServices(platformServices: PlatfromServiceSubscription[]) {
        this.response.success = true
        this.response.existingPlatformService = platformServices
        return this
    }

    withPlatformServiceHavingFreeTrial(platformServiceIds: string[]) {
        this.response.success = true
        this.response.platformServicehavingFreeTrial = platformServiceIds
        return this
    }

    build() {
        return this.response
    }
}




