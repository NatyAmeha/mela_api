import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Field, Float, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";

@InputType()
export class CreateOrderItemInput {
    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]

    @Field(types => Float)
    @IsNumber()
    quantity: number

    @Field()
    branchId?: string

    @Field()
    image: string

    @Field()
    productId: string

    @Field()
    subTotal: number

    @Field(types => [OrderItemDiscountInput])
    discount?: OrderItemDiscountInput[]
}

@InputType()
export class OrderItemDiscountInput {
    @Field(types => [LocalizedFieldInput])
    name: LocalizedFieldInput[]
    @Field(types => Float)
    amount: number

    constructor(partial?: Partial<OrderItemDiscountInput>) {
        Object.assign(this, partial)
    }
}

export class OrderPaymentMethodInput {
    @Field(types => [LocalizedFieldInput])
    name: LocalizedFieldInput[]
    @Field(types => Float)
    amount: number
    constructor(partial) {
        Object.assign(this, partial);
    }
}