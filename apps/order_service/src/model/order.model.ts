import { Directive, Field, Float, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User } from "apps/auth/src/auth/model/user.model";
import { OrderItem, OrderItemDiscount } from "./order_item.model";
import { LocalizedField } from "@app/common/model/localized_model";
import { OrderItemDiscountInput } from "../dto/order_item.input";
import { CreateOrderInput } from "../dto/order.input";

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
    constructor(partial?: Partial<Order>) {
        Object.assign(this, partial);
    }

    getProductIds() {
        return this.items.map(item => item.productId);
    }

    static createOrderInfo(userId: string, orderInfo: CreateOrderInput) {
        return new Order({
            userId,
            orderType: orderInfo.orderType,
            status: OrderStatus.PENDING.toString(),
            items: orderInfo.items.map(item => new OrderItem({
                name: item.name,
                quantity: item.quantity,
                branchId: item.branchId,
                image: item.image,
                productId: item.productId,
                subTotal: item.subTotal,
                discount: item.discount?.map(discount => new OrderItemDiscount(discount))
            })),
            paymentType: orderInfo.paymentType,
            remainingAmount: orderInfo.remainingAmount,
            subTotal: orderInfo.subTotal,
            discount: orderInfo.discount?.map(discount => new OrderItemDiscount(discount)),
            totalAmount: orderInfo.totalAmount,
            paymentMethods: orderInfo.paymentMethods?.map(paymentMethod => new OrderPaymentMethod(paymentMethod)),
            isOnlineOrder: orderInfo.isOnlineOrder,
            note: orderInfo.note,
            branchId: orderInfo.branchId,
            updatedAt: new Date(Date.now()),
        });
    }
}

export class OrderBuilder {
    private order: Order;
    constructor() {
        this.order = new Order();
    }

    withOrderNumber(orderNumber: number) {
        this.order.orderNumber = orderNumber;
        return this;
    }

    forUser(userId: string) {
        this.order.userId = userId;
        return this;
    }

    createPurchaseOrder(items: OrderItem[]) {
        // to do
        this.order.items = items;
        return this;
    }

    createBookingOrder(items: OrderItem[]) {
        // to do
        this.order.items = items;
        return this;
    }

    createRentalOrder(items: OrderItem[]) {
        // to do
        this.order.items = items;
        return this;
    }

    withPaymentInfo(paymentType: string) {
        // to do
        this.order.paymentType = paymentType;
        return this;
    }


    build() {
        return this.order;
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