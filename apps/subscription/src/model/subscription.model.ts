import { BaseModel } from "@app/common/model/base.model";
import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { SubscriptionPlan } from "./subscription_plan.model";
import { SubscriptionType } from "./subscription_type.enum";
import { types } from "joi";

@ObjectType()
@InputType("SubscriptionInput")
export class Subscription extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field(type => Date)
    startDate: Date
    @Field(type => Date)
    endDate: Date
    @Field()
    subscriptioinPlanId?: string
    @Field()
    isTrialPeriod: boolean
    @Field(type => SubscriptionType)
    type: string
    @Field({ description: "owner can be business id, service id, product id" })
    owner?: string
    @Field(type => Date)
    createdAt?: Date
    @Field(type => Date)
    updatedAt: Date

    @Field(type => SubscriptionPlan)
    plan?: SubscriptionPlan

    @Field(type => [PlatfromServiceSubscription])
    platformServices?: PlatfromServiceSubscription[]

    constructor(data: Partial<Subscription>) {
        super()
        Object.assign(this, data)
    }

}

@ObjectType()
@InputType("PlatformServiceSubscriptionInput")
export class PlatfromServiceSubscription {
    @Field(type => ID)
    serviceId: string
    @Field(type => Date)
    startDate: Date
    @Field(type => Date)
    endDate: Date
    @Field()
    isTrialPeriod?: boolean
    @Field(type => Date)
    createdAt?: Date
    @Field(type => Date)
    updatedAt: Date
    @Field(type => [String])
    selectedCustomizationId: string[]
}