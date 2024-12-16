import { BaseModel } from "@app/common/model/base.model";
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Price } from "@app/common/model/price.model";
import { Directive, Field, Float, ID, InputType, ObjectType, PartialType, registerEnumType } from "@nestjs/graphql";
import { CreateProductAddonInput, UpdateProductAddonInput } from "../dto/product_addon.input";
import { Type } from "class-transformer";
import { Product } from "./product.model";
import { Discount } from "./discount.model";

export enum AddonInputType {
    NUMBER_INPUT = "QUANTITY_INPUT",
    TEXT_INPUT = "TEXT_INPUT",
    SINGLE_SELECTION_INPUT = "SINGLE_SELECTION_INPUT",
    MULTIPLE_SELECTION_INPUT = "MULTIPLE_SELECTION_INPUT",
    DATE_INPUT = "DATE_INPUT",
    TIME_INPUT = "TIME_INPUT",
    DATE_RANGE_INPUT = "DATE_RANGE_INPUT",
    DATE_TIME_INPUT = "DATE_TIME_INPUT",
    NO_INPUT_REQUIRED = "NO_INPUT",
    LOCATION_PER_KM_INPUT = "LOCATION_PER_KM_INPUT",
    LOCATION_INPUT = "LOCATION_INPUT",
    PRODUCT_SELECTION_INPUT = "PRODUCT_SELECTION_INPUT",
    PRODUCT_SELECTION_WITH_ADDON_DISCOUNT_INPUT = "PRODUCT_SELECTION_WITH_ADDON_DISCOUNT_INPUT"
}

@ObjectType()
@Directive('@shareable')
export class ProductAddon extends BaseModel {
    @Field(types => ID)
    id: string;
    @Field(type => [LocalizedField])
    name: LocalizedField[]
    @Field(type => [LocalizedField])
    summary?: LocalizedField[]
    @Field(type => [LocalizedField])
    description?: LocalizedField[]
    @Field(types => String)
    inputType?: string
    @Field(types => Float, { defaultValue: 1 })
    minAmount?: number
    @Field(types => Float, { defaultValue: 1 })
    maxAmount?: number
    @Field(types => [ProductAddonOption], { defaultValue: [] })
    options?: ProductAddonOption[]
    @Field({ defaultValue: "NONE" })
    condition?: string
    @Field()
    conditionValue?: string
    @Field()
    checkCalendar?: boolean
    @Field(types => String)
    calendarId?: string
    @Field(types => [String], { defaultValue: [] })
    tag?: string[]
    @Field({ defaultValue: false })
    isActive: boolean
    @Field({ defaultValue: false })
    isRequired: boolean
    @Field({ defaultValue: false })
    isProduct: boolean
    @Field()
    isDateRange?: boolean
    @Field(types => [String])
    productIds?: string[]

    @Field(type => [AddonProductOptionInfo], { defaultValue: [] })
    productOptionInfos?: AddonProductOptionInfo[]

    @Field(type => Boolean, { defaultValue: true })
    includeOnPOS?: boolean

    @Field(type => [Product])
    products?: Product[]

    @Field(types => [Price], { defaultValue: [] })
    additionalPrice: Price[]
    @Field(types => [String])
    membershipIds?: string[]
    @Field()
    createdAt?: Date
    @Field()
    updatedAt?: Date

    @Field()
    category?: string
    @Field()
    dependndentOnAddon?: string

    constructor(partial?: Partial<ProductAddon>) {
        super()
        Object.assign(this, partial)
    }

    static fromCreateProductAddon(createProductAddonInput: CreateProductAddonInput | UpdateProductAddonInput) {
        return new ProductAddon({
            ...createProductAddonInput,
            name: createProductAddonInput.name?.map(name => new LocalizedField(name)),
        })
    }
}

@ObjectType()
@Directive('@shareable')
export class ProductAddonOption {
    @Field(types => ID)
    id?: string
    @Field(type => [LocalizedField] || [LocalizedFieldInput])
    name: LocalizedField[]
    @Field(types => [String], { defaultValue: [] })
    images?: string[]
    @Field(types => [String], { defaultValue: [] })
    membershipIds?: string[]
    @Field(types => [Price], { defaultValue: [] })
    price?: Price[]

}

@ObjectType()
export class AddonProductOptionInfo {
    @Field(type => String)
    productId: string
    @Field(type => [Discount])
    discounts: Discount[]
    @Field(type => Float, { defaultValue: 1 })
    minQty: number
    @Field(type => Float, { defaultValue: 10 })
    maxQty: number
    @Field(type => Product)
    product?: Product
}

@InputType()
export class ProductAddonOptionInput {
    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]
    @Field(type => [String], { defaultValue: [] })
    images?: string[]

}

registerEnumType(AddonInputType, { name: 'AddonInputType' })