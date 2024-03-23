
import { Field, Float, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { DeliveryInfo } from "./delivery.model";
import { Business } from "../../business/model/business.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { Branch } from "../../branch/model/branch.model";
import { Customer } from "../../customer/model/customer.model";
import { Gallery } from "../../business/model/gallery.model";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
@ObjectType()
@InputType('ProductInput')
export class Product {
    @Field(types => String, { nullable: true })
    id?: string;

    @Field(types => [LocalizedData])
    @Type(() => LocalizedData)
    name: LocalizedData[];

    @Field(types => [LocalizedData])
    @Type(() => LocalizedData)
    description: LocalizedData[];

    @Field(types => [String])
    tag?: string[];

    @Field(types => Gallery)
    @Type(() => Gallery)
    gallery: Gallery;

    @Field(types => Int, { defaultValue: 0 })
    loyaltyPoint: number;

    @Field(types => String)
    businessId: string;

    @Field(types => Business)
    @Type(() => Business)
    business: Business

    @Field(types => [String])
    productGroupId?: string[];

    @Field(types => Boolean, { defaultValue: false })
    isActive: boolean;

    @Field(types => [String])
    category: string[];

    @Field(types => Float)
    price: number;

    @Field(types => ProductType)
    type: string;

    @Field(types => Date)
    createdAt?: Date;

    @Field(types => Date)
    updatedAt?: Date;

    @Field(types => Boolean, { defaultValue: false })
    canOrderOnline: boolean;

    @Field(types => String)
    unit?: string;

    @Field(types => [String])
    reviewTopics?: string[];

    @Field(types => String)
    callToAction?: string;

    // @Field(types => [{ planId: String }])
    // subscriptionPlan?: { planId: string }[];

    @Field(types => DeliveryInfo)
    @Type(() => DeliveryInfo)
    @ValidateNested()
    deliveryInfo?: DeliveryInfo;

    @Field(types => [String])
    branchIds?: string[];

    @Field(types => [Branch])
    @Type(() => Branch)
    branches?: Branch[];



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

