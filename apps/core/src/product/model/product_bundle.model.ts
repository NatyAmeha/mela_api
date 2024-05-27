import { LocalizedField } from "@app/common/model/localized_model";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Gallery } from "../../business/model/gallery.model";
import { Discount } from "./discount.model";
import { Product } from "./product.model";
import { Business } from "../../business/model/business.model";
import { Branch } from "../../branch/model/branch.model";

export enum BundleType {
    PRODUCT_BUNDLE = "PRODUCT_BUNDLE",
    SERVICE_BUNDLE = "SERVICE_BUNDLE",
    TIMELY_BUNDLE = "TIMELY_BUNDLE",


}

@ObjectType({ isAbstract: true })
export class ProductBundle {
    @Field(types => ID)
    id: string
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field(types => [LocalizedField])
    description: LocalizedField[]
    @Field(types => BundleType)
    type: string
    @Field(types => [String])
    productIds: string[]
    @Field(types => [String])
    branchIds: string[]
    @Field()
    businessId: string
    @Field(types => Date)
    startDate?: Date
    @Field(types => Date)
    endDate?: Date
    @Field(types => Gallery)
    gallery: Gallery
    @Field(types => Discount)
    discount?: Discount

    @Field(types => [Product])
    products?: Product[]
    @Field(types => Business)
    business?: Business;
    @Field(types => [Branch])
    branches?: Branch[];
}

registerEnumType(BundleType, { name: "BundleType" })