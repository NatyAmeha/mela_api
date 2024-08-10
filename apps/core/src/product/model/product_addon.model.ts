import { BaseModel } from "@app/common/model/base.model";
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Price } from "@app/common/model/price.model";
import { Field, Float, ID, InputType, ObjectType, PartialType, registerEnumType } from "@nestjs/graphql";
import { CreateProductAddonInput, UpdateProductAddonInput } from "../dto/product_addon.input";
import { Type } from "class-transformer";

export enum AddonInputType {
    NUMBER_INPUT = "QUANTITY_INPUT",
    TEXT_INPUT = "TEXT_INPUT",
    SINGLE_SELECTION_INPUT = "SINGLE_SELECTION_INPUT",
    MULTIPLE_SELECTION_INPUT = "MULTIPLE_SELECTION_INPUT",
    DATE_INPUT = "DATE_INPUT",
    TIME_INPUT = "TIME_INPUT",
    DATE_TIME_INPUT = "DATE_TIME_INPUT",
    NO_INPUT_REQUIRED = "NO_INPUT_REQUIRED"
}

@ObjectType()
export class ProductAddon extends BaseModel {
    @Field(types => ID)
    id: string;
    @Field(type => [LocalizedField])
    name: LocalizedField[]
    @Field(types => AddonInputType)
    inputType: string
    @Field(types => Float, { defaultValue: 1 })
    minAmount?: number
    @Field(types => Float, { defaultValue: 1 })
    maxAmount?: number
    @Field(types => [ProductAddonOption], { defaultValue: [] })
    options?: ProductAddonOption[]
    @Field()
    checkCalendar?: boolean
    @Field(types => [String], { defaultValue: [] })
    tag?: string[]
    @Field({ defaultValue: false })
    isActive: boolean
    @Field({ defaultValue: false })
    isRequired: boolean
    @Field({ defaultValue: false })
    isProduct: boolean
    @Field(types => [String])
    productIds?: string[]
    @Field(types => [Price], { defaultValue: [] })
    additionalPrice: Price[]

    @Field()
    createdAt?: Date
    @Field()
    updatedAt?: Date
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
export class ProductAddonOption {
    @Field(types => ID)
    id?: string
    @Field(type => [LocalizedField] || [LocalizedFieldInput])
    name: LocalizedField[]
    @Field(types => [String], { defaultValue: [] })
    images?: string[]

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