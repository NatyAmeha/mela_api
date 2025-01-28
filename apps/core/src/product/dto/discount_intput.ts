import { Discount, DiscountType } from "../model/discount.model"

import { Float, InputType } from "@nestjs/graphql"

import { Field } from "@nestjs/graphql"
import { DiscountCondition } from "../model/discount.model"
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model"

@InputType()
export class DiscountInput {

    @Field(type => [LocalizedFieldInput])
    name?: LocalizedFieldInput[]
    @Field(types => String)
    type: string
    @Field(types => Float)
    value: number
    @Field(types => String, { defaultValue: DiscountCondition.NONE.toString() })
    condition: string
    @Field(types => String, { nullable: true })
    conditionValue?: string
    @Field(types => Date, { nullable: true })
    startDate?: Date
    @Field(types => Date, { nullable: true })
    endDate?: Date

    constructor(partial?: Partial<DiscountInput>) {
        Object.assign(this, partial)
    }

    toDiscount(): Discount {
        return new Discount({
            name: this.name.map(f => new LocalizedField({ key: f.key, value: f.value })),
            type: this.type,
            value: this.value,
            condition: this.condition,
            conditionValue: this.conditionValue,
            startDate: this.startDate,
            endDate: this.endDate
        })
    }
}