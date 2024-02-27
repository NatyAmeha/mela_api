import { BaseModel } from "@app/common/model/base.model";
import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { SubscriptionPlan } from "./subscription_plan.model";
import { SubscriptionType } from "./subscription_type.enum";

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

    constructor(data: Partial<Subscription>) {
        super()
        Object.assign(this, data)
    }

}