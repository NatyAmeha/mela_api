import { Directive, Field, Float, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User } from "apps/auth/src/auth/model/user.model";
import { OrderItem, OrderItemDiscount } from "./order_item.model";
import { LocalizedField } from "@app/common/model/localized_model";
import { OrderItemDiscountInput } from "../dto/order_item.input";

export enum OrderType {
    BOOKING = "BOOKING",
    PURCHASE = "PURCHASE",
    RENTAL = "RENTAL",
}

export enum OrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
    FAILED = "FAILED",

}

@ObjectType()
@Directive('@shareable')
export class Order {
    @Field(types => ID)
    id: string;
    @Field()
    orderNumber?: number
    @Field(types => OrderType)
    orderType: string
    @Field(types => OrderStatus, { defaultValue: OrderStatus.PENDING.toString() })
    status: string
    @Field(types => [OrderItem])
    items: OrderItem[]
    @Field()
    userId: string
    @Field(types => User)
    user?: User
    @Field()
    paymentType: string
    @Field(types => Float)
    remainingAmount?: number
    @Field(types => Float)
    subTotal: number
    @Field(types => [OrderItemDiscount])
    discount?: OrderItemDiscount[]
    @Field(types => Float)
    totalAmount?: number

    @Field(types => [OrderPaymentMethod])
    paymentMethods?: OrderPaymentMethod[]

    @Field()
    isOnlineOrder?: boolean
    @Field()
    note?: string
    @Field(types => [String])
    businessId?: string[]
    @Field()
    branchId?: string

    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;
    constructor(partial) {
        Object.assign(this, partial);
    }
}

@ObjectType()
@Directive('@shareable')
export class OrderPaymentMethod {
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field(types => Float)
    amount: number
    @Field()
    createdAt: Date
    @Field()
    updatedAt: Date
    constructor(partial) {
        Object.assign(this, partial);
    }
}

registerEnumType(OrderType, { name: 'OrderType' })
registerEnumType(OrderStatus, { name: 'OrderStatus' })