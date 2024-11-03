import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { Discount } from "apps/core/src/product/model/discount.model";
import { CreateRewardInput } from "../dto/reward.input";

@ObjectType()
@Directive('@shareable')
export class Reward {
    @Field(type => ID)
    id: string
    @Field(type => [LocalizedField])
    name: LocalizedField[]
    @Field(type => [LocalizedField])
    description: LocalizedField[]


    @Field(type => Int)
    minPointsToRedeem: number;

    @Field(type => [LocalizedField])
    conditions: LocalizedField[]

    @Field(type => String)
    businessId: string

    @Field(type => String)
    rewardType?: string

    @Field({ defaultValue: true })
    isActive: boolean

    @Field(type => String)
    discountType?: string

    @Field(type => Float)
    discountAmount?: number

    @Field()
    createdAt?: Date
    @Field()
    updatedAt?: Date

    constructor(partial?: Partial<Reward>) {
        Object.assign(this, partial);
    }

    static fromInput(input: CreateRewardInput): Reward {
        return new Reward({
            ...input,
            name: input.name.map(n => new LocalizedField(n)),
            description: input.description.map(d => new LocalizedField(d)),
            conditions: input.conditions.map(c => new LocalizedField(c))
        })
    }
}