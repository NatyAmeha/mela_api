import { LocalizedField } from "@app/common/model/localized_model";
import { Price } from "@app/common/model/price.model";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Subscription } from "../../model/subscription.model";
import { Benefit } from "./benefit.model";
import { Group } from "./group.model";
import { CreateMembershipInput, UpdateMembershipInput } from "../dto/membership.input";

export enum MembershipType {
    BUSINESS = "BUSINESS",
}

export enum MembershipPerkType {
    DISCOUNT_ON_MEMBERS_PRODUCT = "DISCOUNT_ON_MEMBERS_PRODUCT",
    DISCOUNT = "DISCOUNT",
    FREE = "FREE",
    CASHBACK = "CASHBACK",
    POINTS = "POINTS",
    OTHER = "OTHER"

}


@ObjectType()
export class Membership {
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
    @Field(type => [Group])
    groups?: Group[]
    @Field(type => [String])
    subscriptionsId?: string[]
    @Field(type => [Subscription])
    subscriptions?: Subscription[]
    @Field(type => [String])
    membersProductIds?: string[]

    constructor(data: Partial<Membership>) {
        Object.assign(this, data)
    }


    static fromCreateMembershipPlanInput(data: CreateMembershipInput | UpdateMembershipInput, ownerId?: string) {
        const membershipInfo = new Membership({
            ...data, owner: ownerId,
            name: data.name?.map(name => new LocalizedField({ ...name })),
            description: data.description?.map(description => new LocalizedField({ ...description })),
            benefits: data.benefits?.map(benefit => new Benefit({ ...benefit })),
            price: data.price?.map(price => new Price({ ...price })),
        })
        return membershipInfo;
    }
}


registerEnumType(MembershipType, { name: "MembershipType" })
registerEnumType(MembershipPerkType, { name: "MembershipPerkType" })