
import { Field, Float, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { DeliveryInfo, DeliveryInfoInput } from "./delivery.model";
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Branch } from "../../branch/model/branch.model";
import { Customer } from "../../customer/model/customer.model";
import { Gallery, GalleryInput } from "../../business/model/gallery.model";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { BaseModel } from "@app/common/model/base.model";
import { Business } from "../../business/model/business.model";

@ObjectType()

export class Product extends BaseModel {
    @Field(types => String)
    id?: string;

    @Field(type => [LocalizedField])
    name: LocalizedField[]

    @Field(types => [LocalizedField])
    description: LocalizedField[];

    @Field(types => Gallery)
    gallery: Gallery;

    @Field(types => Business)
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

    @Field(types => ProductUnitType, { defaultValue: "Unit" })
    unit?: string;

    @Field(types => [String])
    reviewTopics?: string[];

    @Field(types => CallToActionType, { defaultValue: "Order" })
    callToAction?: string;

    @Field(types => [String])
    branchIds?: string[];

    @Field(types => DeliveryInfo)
    @ValidateNested()
    deliveryInfo?: DeliveryInfo;

    @Field(types => [Branch])
    branches?: Branch[];

    constructor(partial?: Partial<Product>) {
        super()
        Object.assign(this, partial);
    }
}

export enum ProductType {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    GIFT_CARD = "GIFT_CARD",
    MEMBERSHIP = "MEMBERSHIP",
}

export enum ProductUnitType {
    Unit = "Unit",
    Kg = "Kg",
    Litre = "Litre",
}

export enum CallToActionType {
    Order = "Order",
    Call = "Call",
    Book = "Book",
    Reserve = "Reserve",
}

registerEnumType(ProductType, { name: "ProductType" });
registerEnumType(ProductUnitType, { name: "ProductUnitType" });
registerEnumType(CallToActionType, { name: "CallToActionType" });



