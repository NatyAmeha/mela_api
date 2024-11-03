import { Directive, Field, Float, ID, ObjectType } from "@nestjs/graphql"

@ObjectType()
@Directive('@shareable')
export class RedeemedReward {
    @Field(type => ID)
    id: string
    @Field(type => String)
    rewardId: string

    @Field(type => String)
    businessId: string

    @Field(type => String)
    customerId: string

    @Field(type => Float)
    pointUsed: number

    @Field(type => Date)
    createdAt?: Date

    constructor(partial?: Partial<RedeemedReward>) {
        Object.assign(this, partial)
    }
}