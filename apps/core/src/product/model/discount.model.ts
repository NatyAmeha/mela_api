import { Field, Float, ObjectType, registerEnumType } from "@nestjs/graphql"

export enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    AMOUNT = "AMOUNT",

}

export enum DiscountCondition {
    NONE = "NONE",
    PURCHASE_ALL_ITEMS = "PURCHASE_ALL_ITEMS",
    MINIMUM_PURCHASE = "MINIMUM_PURCHASE",
    MAXIMUM_PURCHASE = "MAXIMUM_PURCHASE",
    QUANTITY = "QUANTITY"

}

@ObjectType()
export class Discount {
    @Field(types => DiscountType)
    type: string
    @Field(types => Float)
    value: number
    @Field(types => DiscountCondition, { defaultValue: DiscountCondition.NONE })
    condition: string
    @Field(types => Float)
    conditionValue?: number

    constructor(partial?: Partial<Discount>) {
        Object.assign(this, partial)
    }
}

registerEnumType(DiscountType, { name: "DiscountType" })
registerEnumType(DiscountCondition, { name: "DiscountCondition" })