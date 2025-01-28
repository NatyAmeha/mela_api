import { Directive, Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { LocalizedField } from "@app/common/model/localized_model";
import { Reward } from "./reward.model";
import { Business } from "../../business/model/business.model";

@ObjectType()
@Directive('@shareable')
export class LoyaltyTier {
    @Field(type => ID)
    id: string;

    @Field(type => [LocalizedField])
    name: LocalizedField[];

    @Field(type => [LocalizedField])
    description: LocalizedField[];

    @Field(type => [Reward])
    rewards: Reward[];

    @Field(type => [String])
    businessIds: string[];

    @Field(type => [Business], { nullable: true })
    businesses?: Business[];

    @Field(type => [String], { defaultValue: [] })
    productIds: string[];

    @Field(type => Int)
    minPoints: number;

    @Field(type => Int)
    maxPoints: number;

    @Field(type => Date)
    createdAt: Date;

    @Field(type => Date)
    updatedAt: Date;

    constructor(data: Partial<LoyaltyTier>) {
        Object.assign(this, data);
    }
} 