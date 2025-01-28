import { Field, ObjectType } from "@nestjs/graphql";
import { LoyaltyTier } from "./loyalty_tier.model";

@ObjectType()
export class LoyaltyResponse {
    @Field()
    success: boolean;

    @Field()
    message: string;

    @Field(type => LoyaltyTier, { nullable: true })
    tier?: LoyaltyTier

    @Field(type => [LoyaltyTier], { nullable: true })
    tiers?: LoyaltyTier[]

    constructor(partial: Partial<LoyaltyResponse>) {
        Object.assign(this, partial);
    }
} 