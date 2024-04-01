import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PlatfromServiceSubscription, Subscription } from "./subscription.model";
import { SubscriptionPlan } from "./subscription_plan.model";
import { BaseResponse } from "@app/common/model/base.response";

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

}
