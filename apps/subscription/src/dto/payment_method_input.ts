import { LocalizedFieldInput } from "@app/common/model/localized_model"
import { PriceInput } from "@app/common/model/price.model"
import { Field, InputType } from "@nestjs/graphql"
import { Type } from "class-transformer"

@InputType()
export class PaymentMethodInput {
    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]
    @Field(types => PriceInput)
    @Type(() => PriceInput)
    amount: PriceInput

    @Field(types => [String])
    receiptImages?: string[]
}