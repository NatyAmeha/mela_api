import { Field, Float, InputType } from "@nestjs/graphql";
import { OrderStatus, OrderType } from "../model/order.model";
import { CreateOrderItemInput, OrderItemDiscountInput, OrderPaymentMethodInput } from "./order_item.input";
import { Type } from "class-transformer";
import { ArrayNotEmpty } from "class-validator";

@InputType()
export class CreateOrderInput {

    @Field(types => OrderType)
    orderType: string

    @Field(types => [CreateOrderItemInput])
    @Type(() => CreateOrderItemInput)
    @ArrayNotEmpty()
    items: CreateOrderItemInput[]
    @Field()
    orderNumber?: number

    @Field()
    userId: string

    @Field()
    paymentType: string

    @Field(types => Float)
    remainingAmount?: number

    @Field(types => Float)
    subTotal: number

    @Field(types => [OrderItemDiscountInput])
    discount?: OrderItemDiscountInput[]

    @Field(types => Float)
    totalAmount?: number

    @Field(types => [OrderPaymentMethodInput])
    paymentMethods?: OrderPaymentMethodInput[]

    @Field()
    isOnlineOrder?: boolean

    @Field()
    note?: string

    @Field()
    branchId?: string
}