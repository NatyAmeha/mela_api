import { LocalizedField } from "@app/common/model/localized_model";
import { Price } from "@app/common/model/price.model";
import { Directive, Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Subscription } from "../../model/subscription.model";
import { BaseModel } from "@app/common/model/base.model";
import { Benefit } from "./benefit.model";
import { Group } from "./group.model";
import { CreateMembershipInput } from "../dto/membership.input";
import { Product } from "apps/core/src/product/model/product.model";
import { Gallery } from "apps/core/src/business/model/gallery.model";

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
export class Membership extends BaseModel {
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

    constructor(data: Partial<Membership>) {
        super()
        Object.assign(this, data)
    }


    static fromCreateMembershipPlanInput(data: CreateMembershipInput, ownerId: string) {
        return new Membership({
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            benefits: data.benefits?.map(benefit => new Benefit(benefit)),
            duration: data.duration,
            type: data.type,
            owner: ownerId,

        })
    }
}


registerEnumType(MembershipType, { name: "MembershipType" })
registerEnumType(MembershipPerkType, { name: "MembershipPerkType" })