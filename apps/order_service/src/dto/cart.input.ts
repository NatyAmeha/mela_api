import { LocalizedFieldInput } from "@app/common/model/localized_model"
import { Field, InputType } from "@nestjs/graphql"
import { ArrayNotEmpty, ValidateNested } from "class-validator"
import { CreateOrderItemInput } from "./order_item.input"
import { Type } from "class-transformer"
import { CreatePaymentOptionInput } from "apps/core/src/business/dto/payment_option.input"
import { CreateOrderConfigInput } from "./order_config.input"

@InputType()
export class CreateCartInput {
    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @ArrayNotEmpty()
    name: LocalizedFieldInput[]

    @Field(types => [CreateOrderItemInput])
    @Type(() => CreateOrderItemInput)
    @ValidateNested()
    @ArrayNotEmpty()
    items: CreateOrderItemInput[]

    @Field(types => [CreateOrderConfigInput])
    @Type(() => CreateOrderConfigInput)
    configs: CreateOrderConfigInput[]

    @Field(types => [CreatePaymentOptionInput])
    @Type(() => CreatePaymentOptionInput)
    paymentOptions?: CreatePaymentOptionInput[]

    constructor(partial?: Partial<CreateCartInput>) {
        Object.assign(this, partial)
    }
}