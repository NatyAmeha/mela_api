import { Directive, Field, Float, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User } from "apps/auth/src/auth/model/user.model";
import { OrderItem, OrderItemDiscount } from "./order_item.model";
import { LocalizedField } from "@app/common/model/localized_model";
import { CreateOrderItemInput, OrderItemDiscountInput, OrderPaymentMethodInput } from "../dto/order_item.input";
import { CreateOrderInput } from "../dto/order.input";
import { OrderConfig } from "./order.config.model";
import { PaymentOptionType } from "apps/core/src/business/model/payment_option.model";

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
    // @Field(types => OrderType)
    // orderType: string
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

    // static createOrderInfo(userId: string, orderInfo: CreateOrderInput) {
    //     return new Order({
    //         // userId,
    //         // orderType: orderInfo.orderType,
    //         // status: OrderStatus.PENDING.toString(),
    //         items: orderInfo.items.map(item => new OrderItem({
    //             name: item.name,
    //             quantity: item.quantity,
    //             branchId: item.branchId,
    //             image: item.image,
    //             productId: item.productId,
    //             subTotal: item.subTotal,
    //             discount: item.discount?.map(discount => new OrderItemDiscount(discount)),
    //             config: item.config?.map(config => new OrderConfig(config)),
    //         })),
    //         // paymentType: orderInfo.paymentType,
    //         // remainingAmount: orderInfo.remainingAmount,
    //         // subTotal: orderInfo.subTotal,
    //         // discount: orderInfo.discount?.map(discount => new OrderItemDiscount(discount)),
    //         // totalAmount: orderInfo.totalAmount,
    //         // paymentMethods: orderInfo.paymentMethods?.map(paymentMethod => new OrderPaymentMethod(paymentMethod)),
    //         // isOnlineOrder: orderInfo.isOnlineOrder,
    //         // note: orderInfo.note,
    //         branchId: orderInfo.branchId,
    //         // updatedAt: new Date(Date.now()),
    //     });
    // }
}

export class OrderBuilder {
    private order: Order;
    constructor() {
        this.order = new Order();
    }

    createOrderFromOnlineStore(userId: string) {
        // to do
        this.order.userId = userId;
        this.order.isOnlineOrder = true;
        this.order.status = OrderStatus.PENDING;
        return this;
    }

    withItems(items: CreateOrderItemInput[]) {
        this.order.items = items.map(item => new OrderItem({
            name: item.name,
            quantity: item.quantity,
            branchId: item.branchId,
            image: item.image,
            productId: item.productId,
            subTotal: item.subTotal,
            discount: item.discount?.map(discount => new OrderItemDiscount(discount)),
            config: item.config?.map(config => new OrderConfig(config)),
        }));
        return this;
    }

    withPaymentInfo(paymentType: string, { remainingAmount, totalAmount, subtotal, paymentMethods, }: { remainingAmount?: number, totalAmount?: number, subtotal?: number, paymentMethods?: OrderPaymentMethodInput[] }) {
        this.order.paymentType = paymentType;
        this.order.paymentMethods = paymentMethods?.map(paymentMethod => new OrderPaymentMethod(paymentMethod));
        this.order.subTotal = subtotal;
        this.order.totalAmount = totalAmount;
        if (paymentType == PaymentOptionType.PAY_LATER) {
            this.order.remainingAmount = remainingAmount
        }
        return this;
    }
    withDiscount(discount?: OrderItemDiscountInput[]) {
        if (discount) {
            this.order.discount = discount?.map(discount => new OrderItemDiscount(discount));
        }
        return this;
    }

    withAdditionalInfo({ orderNumber, note }: { orderNumber?: number, note?: string }) {
        this.order.orderNumber = orderNumber;
        this.order.note = note;
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