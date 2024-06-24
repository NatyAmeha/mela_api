import { BaseModel } from "@app/common/model/base.model";
import { LocalizedField } from "@app/common/model/localized_model";
import { Price } from "@app/common/model/price.model";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { CreateProductAddonInput, UpdateProductAddonInput } from "../dto/product_addon.input";

@ObjectType({ isAbstract: true })
export class ProductAddon extends BaseModel {
    @Field(types => ID)
    id: string;
    @Field(type => [LocalizedField])
    name: LocalizedField[]
    @Field(types => Float, { defaultValue: 1 })
    minQty: number
    @Field(types => Float, { defaultValue: 1 })
    maxQty: number
    @Field(types => [String], { defaultValue: [] })
    tag?: string[]
    @Field({ defaultValue: false })
    isActive: boolean
    @Field({ defaultValue: false })
    isRequired: boolean
    @Field({ defaultValue: false })
    isProduct: boolean
    @Field()
    productId?: string
    @Field(type => [Price], { defaultValue: [] })
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
            additionalPrice: createProductAddonInput.additionalPrice?.map((price) => Price.fromCreatePriceInput(price))
        })
    }
}