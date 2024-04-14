import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PlatfromServiceSubscription, Subscription } from "./subscription.model";
import { SubscriptionPlan } from "./subscription_plan.model";
import { BaseResponse } from "@app/common/model/base.response";
import { PlatformService } from "./platform_service.model";

@ObjectType()
export class SubscriptionResponse extends BaseResponse {
    @Field(type => Subscription, { description: "subscription info created" })
    createdSubscription?: Subscription;
    @Field(type => SubscriptionPlan, { description: "Subscription plan info that is subscribed" })
    plan?: SubscriptionPlan
    @Field(type => [Subscription], { description: "existing subscription available for requested by planId and owner" })
    existingActiveSubscriptions?: Subscription[]
    @Field(type => [Subscription])
    deletedSubscritpions?: Subscription[]
    @Field(type => [PlatfromServiceSubscription])
    addedPlatformServices?: PlatfromServiceSubscription[]
    @Field(type => [PlatfromServiceSubscription])
    existingPlatformService?: PlatfromServiceSubscription[]
    @Field(type => [String])
    platformServicehavingFreeTrial?: string[]

    constructor(data: Partial<SubscriptionResponse>) {
        super()
        Object.assign(this, data)
    }

    changeSubscritpioStatus(status: boolean) {
        this.createdSubscription.isActive = status;
    }
}


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
