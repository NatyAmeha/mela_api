import { LocalizedFieldInput } from "@app/common/model/localized_model"
import { Field, InputType } from "@nestjs/graphql"
import { ArrayNotEmpty, ValidateNested } from "class-validator"
import { CreateOrderItemInput } from "./order_item.input"
import { Type } from "class-transformer"

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

    constructor(partial?: Partial<CreateCartInput>) {
        Object.assign(this, partial)
    }
}