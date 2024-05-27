import { LocalizedField } from "@app/common/model/localized_model";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Gallery } from "../../business/model/gallery.model";
import { Discount, DiscountCondition } from "./discount.model";
import { Product } from "./product.model";
import { Business } from "../../business/model/business.model";
import { Branch } from "../../branch/model/branch.model";
import { CreateBundleInput, UpdateBundleInput } from "../dto/product_bundle.input";
import { CreateProductInput } from "../dto/product.input";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

export enum BundleType {
    DEFAULT = "DEFAULT",
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
    @Field({ defaultValue: true })
    isActive?: boolean
    @Field()
    createdAt?: Date
    @Field()
    updatedAt?: Date

    constructor(partial?: Partial<ProductBundle>) {
        Object.assign(this, partial)
    }

    static fromCreateBundleInput({ businessId, branchIds, input }: { businessId: string, branchIds: string[], input: CreateBundleInput }) {
        const bundle = new ProductBundle({
            name: input.name,
            description: input.description,
            type: input.type,
            gallery: input.gallery,
            productIds: input.productIds,
            endDate: input.endDate,

        })
        bundle.startDate = input.type == BundleType.TIMELY_BUNDLE ? input.startDate ?? new Date() : null;
        bundle.businessId = businessId;
        bundle.branchIds = branchIds;
        if (input.discountType) {
            bundle.discount = new Discount({
                type: input.discountType, value: input.discountValue,
                condition: input.condition, conditionValue: input.conditionValue ?? (input.condition == DiscountCondition.PURCHASE_ALL_ITEMS ? input.productIds?.length : 0),
            })
        }
        return bundle
    }

    static async fromUpdateBundleInput(businessId: string, updateInput: UpdateBundleInput) {
        const bundleInfo = this.fromCreateBundleInput({ businessId, branchIds: [], input: new CreateBundleInput({ ...updateInput }) })
        return bundleInfo;
    }

}

registerEnumType(BundleType, { name: "BundleType" })