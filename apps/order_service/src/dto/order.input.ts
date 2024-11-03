import { Field, Float, InputType } from "@nestjs/graphql";
import { OrderStatus, OrderType } from "../model/order.model";
import { CreateOrderItemInput, OrderItemDiscountInput, OrderPaymentMethodInput } from "./order_item.input";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsNotEmpty, ValidateIf, ValidateNested } from "class-validator";
import { PaymentOptionType } from "apps/core/src/business/model/payment_option.model";
import { CreateOrderConfigInput } from "./order_config.input";

@InputType()
export class CreateOrderInput {
    // @Field(types => OrderType)
    // orderType: string

    @Field(types => [CreateOrderItemInput])
    @Type(() => CreateOrderItemInput)
    @ArrayNotEmpty()
    items: CreateOrderItemInput[]

    @Field()
    orderNumber?: number

    @Field(type => PaymentOptionType)
    @IsNotEmpty()
    paymentType: string

    @Field(types => Float)
    @ValidateIf(o => o.paymentType === PaymentOptionType.PAY_LATER)
    @IsNotEmpty({ message: 'Remaining amount is required' })
    remainingAmount?: number

    @Field(types => Float)
    paidAmount?: number

    @Field(types => Float)
    subTotal: number

    @Field(types => [OrderItemDiscountInput])
    @Type(() => OrderItemDiscountInput)
    discount?: OrderItemDiscountInput[]

    @Field(types => Float)
    totalAmount?: number

    @Field(type => [CreateOrderConfigInput])
    @Type(() => CreateOrderConfigInput)
    config?: CreateOrderConfigInput[]

    @Field(types => [OrderPaymentMethodInput])
    @Type(() => OrderPaymentMethodInput)
    paymentMethods?: OrderPaymentMethodInput[]

    @Field()
    isOnlineOrder?: boolean

    @Field()
    note?: string

    @Field()
    branchId?: string

    @Field()
    customerName?: string
    @Field()
    customerPhoneNumber?: string

    constructor(partial: Partial<CreateOrderInput>) {
        Object.assign(this, partial);
    }
}