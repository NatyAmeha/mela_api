import { Price, PriceInput } from "@app/common/model/price.model";
import { Directive, Field, ID, ObjectType } from "@nestjs/graphql";
import { types } from "joi";
import { PriceList } from "./price_list_.model";
import { CreateProductPriceInput, UpdateProductPriceInput } from "../dto/product_price.input";
import { Product } from "./product.model";
import { removeNull } from "@app/common/utils/helper";
import { Discount } from "./discount.model";

@ObjectType()
@Directive('@shareable')
export class ProductPrice {
    @Field(types => ID)
    id: string
    @Field(types => String)
    productId: string
    @Field()
    branchId?: string

    @Field(types => [Price])
    price: Price[]
    @Field()
    isActive: boolean
    @Field()
    isDefault: boolean

    @Field()
    createdAt?: Date
    @Field()
    updatedAt?: Date

    @Field(type => Product)
    product: Product

    @Field()
    priceListId?: string

    @Field(type => [Discount])
    discounts?: Discount[]

    @Field(types => PriceList)
    priceList?: PriceList

    constructor(partial: Partial<ProductPrice>) {
        Object.assign(this, partial)
    }

    static fromProductPriceInput(productId: string, createProductPriceInput: CreateProductPriceInput | UpdateProductPriceInput) {
        return new ProductPrice({
            ...createProductPriceInput,
            productId,
            price: createProductPriceInput.price?.map(p => new Price(p)),
        })
    }

    static createDefaultPrice(price: PriceInput[], branchId?: string) {
        const productPrice = new ProductPrice({
            price: price?.map(p => new Price(p)),
            branchId,
            isActive: true,
            isDefault: true,
        })
        removeNull(productPrice)
        return productPrice
    }
}