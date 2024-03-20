
import { Field, Float, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { DeliveryInfo } from "./delivery.model";
import { Business } from "../../business/model/business.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { Branch } from "../../business/model/branch.model";
import { Customer } from "../../customer/model/customer.model";
@ObjectType()
export class Product {
    @Field(() => String, { nullable: true })
    id?: string;

    @Field(() => [LocalizedData])
    name: LocalizedData[];

    @Field(() => [LocalizedData])
    description: LocalizedData[];

    @Field(() => [String],)
    tag?: string[];

    @Field(() => [String])
    gallery: string[];

    @Field(() => Int, { defaultValue: 0 })
    loyaltyPoint: number;

    @Field(() => String)
    businessId: string; F
    @Field(() => Business)
    business: Business

    @Field(() => [String])
    productGroupId?: string[];

    @Field(() => Boolean, { defaultValue: false })
    isActive: boolean;

    @Field(() => [String])
    category: string[];

    @Field(() => Float)
    price: number;

    @Field(() => ProductType)
    type: string;

    @Field(() => Date)
    createdAt?: Date;

    @Field(() => Date)
    updatedAt?: Date;

    @Field(() => Boolean, { defaultValue: false })
    canOrderOnline: boolean;

    @Field(() => String)
    unit?: string;

    @Field(() => [String])
    reviewTopics?: string[];

    @Field(() => String)
    callToAction?: string;

    @Field(() => [{ planId: String }])
    subscriptionPlan?: { planId: string }[];

    @Field(() => DeliveryInfo)
    deliveryInfo?: DeliveryInfo;

    @Field(() => [String])
    branchIds?: string[];
    @Field(() => [Branch])
    branches?: Branch[];
    @Field(() => [String], { defaultValue: [] })
    customersId?: string[];
    @Field(() => [Customer], { defaultValue: [] })
    customers?: Customer[];


    constructor(partial?: Partial<Product>) {
        Object.assign(this, partial);
    }
}

export enum ProductType {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    GIFT_CARD = "GIFT_CARD",
    MEMBERSHIP = "MEMBERSHIP",
}

registerEnumType(ProductType, { name: "ProductType" });

