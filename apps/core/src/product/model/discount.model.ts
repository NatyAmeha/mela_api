import { LocalizedField } from "@app/common/model/localized_model"
import { Directive, Field, Float, ObjectType, registerEnumType } from "@nestjs/graphql"
import { share } from "rxjs"

export enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    AMOUNT = "AMOUNT",

}

export enum DiscountCondition {
    NONE = "NONE",
    PURCHASE_ALL_ITEMS = "PURCHASE_ALL_ITEMS",
    MINIMUM_PURCHASE = "MINIMUM_PURCHASE",
    MAXIMUM_PURCHASE = "MAXIMUM_PURCHASE",
    TIME_BASED = "TIME_BASED",
    QUANTITY = "QUANTITY",
    FIRST_TIME_PURCHASE = "FIRST_TIME_PURCHASE"

}

@ObjectType()
@Directive('@shareable')
export class Discount {
    @Field()
    id?: string
    @Field()
    name?: LocalizedField[]
    @Field(types => DiscountType)
    type: string
    @Field(types => Float)
    value: number
    @Field(types => String, { defaultValue: DiscountCondition.NONE.toString() })
    condition: string
    @Field(types => Float)
    conditionValue?: number
    @Field(types => Date)
    startDate?: Date
    @Field(types => Date)
    endDate?: Date

    constructor(partial?: Partial<Discount>) {
        Object.assign(this, partial)
    }
}

registerEnumType(DiscountType, { name: "DiscountType" })
registerEnumType(DiscountCondition, { name: "DiscountCondition" })