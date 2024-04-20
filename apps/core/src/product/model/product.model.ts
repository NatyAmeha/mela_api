
import { Field, Float, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { DeliveryInfo, DeliveryInfoInput } from "./delivery.model";
import { Business } from "../../business/model/business.model";
import { LocalizedData, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Branch } from "../../branch/model/branch.model";
import { Customer } from "../../customer/model/customer.model";
import { Gallery, GalleryInput } from "../../business/model/gallery.model";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { BaseModel } from "@app/common/model/base.model";

@ObjectType()

export class Product extends BaseModel {
    @Field(types => String)
    id?: string;

    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    name: LocalizedData[]

    @Field(types => [LocalizedData])
    @Type(() => LocalizedData)
    description: LocalizedData[];

    @Field(types => Gallery)
    @Type(() => Gallery)
    gallery: Gallery;

    @Field(types => Business)
    @Type(() => Business)
    business: Business

    @Field(types => [String])
    tag?: string[];


    @Field(types => Int, { defaultValue: 1 })
    minimumOrderQty?: number

    @Field(types => Int, { defaultValue: 0 })
    loyaltyPoint: number;

    @Field(types => String)
    businessId: string;

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

    @Field(types => [String])
    branchIds?: string[];

    @Field(types => DeliveryInfo)
    @Type(() => DeliveryInfo)
    @ValidateNested()
    deliveryInfo?: DeliveryInfo;

    @Field(types => [Branch])
    @Type(() => Branch)
    branches?: Branch[];

    constructor(partial?: Partial<Product>) {
        super()
        Object.assign(this, partial);
    }
}

@InputType()
export class ProductInput {

    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]

    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    description: LocalizedFieldInput[];

    @Field(types => GalleryInput)
    @Type(() => GalleryInput)
    gallery: GalleryInput;

    @Field(types => [String])
    tag?: string[];


    @Field(types => Int, { defaultValue: 1 })
    minimumOrderQty?: number

    @Field(types => Int, { defaultValue: 0 })
    loyaltyPoint: number;

    @Field(types => String)
    businessId: string;

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


    @Field(types => Boolean, { defaultValue: false })
    canOrderOnline: boolean;

    @Field(types => String)
    unit?: string;

    @Field(types => [String])
    reviewTopics?: string[];

    @Field(types => String)
    callToAction?: string;

    @Field(types => [String])
    branchIds?: string[];

    @Field(types => DeliveryInfoInput)
    @Type(() => DeliveryInfoInput)
    @ValidateNested()
    deliveryInfo?: DeliveryInfoInput;

    constructor(partial?: Partial<ProductInput>) {
        Object.assign(this, partial);
    }

    toProduct(): Product {
        var product = new Product({ ...this });
        return product;
    }

}

export enum ProductType {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    GIFT_CARD = "GIFT_CARD",
    MEMBERSHIP = "MEMBERSHIP",
}

registerEnumType(ProductType, { name: "ProductType" });

