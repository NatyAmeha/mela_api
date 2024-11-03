import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Field, Float, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { CreateOrderConfigInput } from "./order_config.input";
import { PriceInput } from "@app/common/model/price.model";

@InputType()
export class CreateOrderItemInput {
    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @ArrayNotEmpty({ message: 'Order item name is required' })
    name: LocalizedFieldInput[]

    @Field(types => Float)
    @IsNumber()
    quantity: number

    @Field()
    branchId?: string

    @Field()
    @IsNotEmpty()
    image: string

    @Field()
    @IsNotEmpty()
    productId: string

    @Field(type => Float)
    subTotal: number

    @Field(type => Float)
    total: number

    @Field(types => [OrderItemDiscountInput])
    discount?: OrderItemDiscountInput[]

    @Field(type => [CreateOrderConfigInput])
    @Type(() => CreateOrderConfigInput)
    @ValidateNested()
    config?: CreateOrderConfigInput[]

    @Field(type => Float, { defaultValue: 0 })
    point?: number
}

@InputType()
export class OrderItemDiscountInput {
    @Field(types => [LocalizedFieldInput])
    name: LocalizedFieldInput[]
    @Field(types => Float)
    amount: number

    @Field(types => [String])
    claimedRewardId?: string[]

    constructor(partial?: Partial<OrderItemDiscountInput>) {
        Object.assign(this, partial)
    }
}

@InputType()
export class OrderPaymentMethodInput {
    @Type(() => LocalizedFieldInput)
    @Field(types => [LocalizedFieldInput])
    name: LocalizedFieldInput[]

    @Type(() => PriceInput)
    @Field(types => PriceInput)
    amount: PriceInput

    @Field({ defaultValue: false })
    requireReceiptImage: boolean

    @Field(types => [String])
    receiptImages?: string[]
    constructor(partial) {
        Object.assign(this, partial);
    }
}