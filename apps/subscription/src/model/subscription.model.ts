import { BaseModel } from "@app/common/base.model";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { SubscriptionPlan } from "./subscription_plan.model";
import { SubscriptionType } from "./subscription_type.enum";

@ObjectType()
export class Subscription extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field(type => Date)
    startDate: Date
    @Field(type => Date)
    endDate: Date
    @Field()
    planId: string
    @Field()
    isTrialPeriod: boolean
    @Field(type => SubscriptionType)
    type: SubscriptionType
    @Field()
    owner?: string
    @Field(type => Date)
    createdAt?: Date
    @Field(type => Date)
    updatedAt: Date

    @Field(type => SubscriptionPlan)
    plan?: SubscriptionPlan

    constructor(data: Partial<Subscription>) {
        super()
        Object.assign(this, data)
    }

}