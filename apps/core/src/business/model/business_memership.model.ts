import { LocalizedField } from "@app/common/model/localized_model";
import { Price } from "@app/common/model/price.model";
import { Directive, Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Benefit } from "apps/subscription/src/membership/model/benefit.model";

// Contains the BusinessMembership information for the business, extension of Main Membership model inside subscription servivce
@ObjectType()
export class BusinessMembership {
    @Field(types => ID)
    id: string;
    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;
    @Field(type => [LocalizedField])
    name: LocalizedField[]
    @Field(type => [LocalizedField])
    description?: LocalizedField[]
    @Field(type => [Price])
    price: Price[]
    @Field(type => [String])
    category?: string[]
    @Field(type => [Benefit])
    benefits: Benefit[]

    @Field(type => Int, { defaultValue: 30 })
    duration: number
    @Field(type => Int, { defaultValue: 0 })
    trialPeriod?: number
    @Field()
    type: string
    @Field()
    owner: string
    @Field({ defaultValue: true })
    isActive: boolean
    @Field(type => [String])
    groupsId: string[]

    @Field(type => [String])
    subscriptionsId?: string[]

    @Field(type => [String])
    membersProductIds?: string[]

    constructor(data: Partial<BusinessMembership>) {
        Object.assign(this, data)
    }

    static fromRawMembershipInfo(data: any[]) {
        if (!data || data.length == 0) return []
        return data.map((membership: any) => {
            return new BusinessMembership({
                ...membership,
            })
        })
    }
}