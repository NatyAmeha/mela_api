import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql"
import { BaseModel } from "@app/common/base.model"
import { Subscription } from "./subscription.model"
import { SubscriptionType } from "./subscription_type.enum"

@ObjectType()
export class SubscriptionPlan extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field(type => [NameType])
    name: NameType[]
    @Field()
    description?: string
    @Field(type => [String])
    category: string[]
    @Field(type => [String])
    benefits: string[]
    @Field(type => Int)
    duration: number
    @Field(type => Int)
    trialPeriod?: number
    @Field(type => SubscriptionType, { description: "platform subscription = 0, busienss = 1, service=2, product=3" })
    type: SubscriptionType
    @Field()
    owner?: string
    @Field()
    isActive?: boolean
    @Field(type => Date)
    createdAt?: Date
    @Field(type => Date)
    updatedAt?: Date

    @Field(type => [Subscription])
    subscriptions?: Subscription[]

    constructor(data: Partial<SubscriptionPlan>) {
        super()
        Object.assign(this, data)
    }
}

@ObjectType()
export class NameType {
    @Field()
    key: string
    @Field()
    value: string
}



