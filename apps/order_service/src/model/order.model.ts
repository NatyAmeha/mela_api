import { Directive, Field, Float, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User } from "apps/auth/src/auth/model/user.model";
import { OrderItem, OrderItemDiscount } from "./order_item.model";
import { LanguageKey, LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { CreateOrderItemInput, OrderItemDiscountInput, OrderPaymentMethodInput } from "../dto/order_item.input";
import { OrderConfig } from "./order.config.model";
import { PaymentOptionType } from "apps/core/src/business/model/payment_option.model";
import { flattenDeep, remove, sum, uniq } from "lodash";
import { Price } from "@app/common/model/price.model";
import { Customer } from "../customer/model/customer.model";
import { CreateOrderConfigInput } from "../dto/order_config.input";
import { OrderSchedule } from "./order_schedule.model";

import { DateUtils } from "@app/common/utils/date_utils";

export enum OrderType {
    BOOKING = "BOOKING",
    PURCHASE = "PURCHASE",
    RENTAL = "RENTAL",
}

export enum AddonInputType {
    NUMBER_INPUT = "QUANTITY_INPUT",
    TEXT_INPUT = "TEXT_INPUT",
    SINGLE_SELECTION_INPUT = "SINGLE_SELECTION_INPUT",
    MULTIPLE_SELECTION_INPUT = "MULTIPLE_SELECTION_INPUT",
    DATE_INPUT = "DATE_INPUT",
    TIME_INPUT = "TIME_INPUT",
    DATE_RANGE_INPUT = "DATE_RANGE_INPUT",
    DATE_TIME_INPUT = "DATE_TIME_INPUT",
    NO_INPUT_REQUIRED = "NO_INPUT",
    LOCATION_PER_KM_INPUT = "LOCATION_PER_KM_INPUT",
    LOCATION_INPUT = "LOCATION_INPUT",
    PRODUCT_SELECTION_INPUT = "PRODUCT_SELECTION_INPUT",
    PRODUCT_SELECTION_WITH_ADDON_DISCOUNT_INPUT = "PRODUCT_SELECTION_WITH_ADDON_DISCOUNT_INPUT"
}

export enum OrderStatus {
    PENDING = "PENDING",
    PAYMENT_APPROVED = "PAYMENT_APPROVED",
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
    @Field()
    code?: string
    // @Field(types => OrderType)
    // orderType: string
    @Field(types => String, { defaultValue: OrderStatus.PENDING.toString() })
    status: string
    @Field(types => [OrderItem])
    items: OrderItem[]
    @Field()
    userId?: string
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

    @Field(types => Float)
    paidAmount?: number

    @Field(types => [OrderConfig])
    config?: OrderConfig[]

    @Field(types => [OrderPaymentMethod])
    paymentMethods?: OrderPaymentMethod[]

    @Field()
    isOnlineOrder?: boolean
    @Field()
    note?: string
    @Field(types => [String])
    businessId?: string[]

    @Field(types => [LocalizedField])
    businessName?: LocalizedField[]

    @Field()
    branchId?: string

    @Field(types => [OrderSchedule])
    schedules?: OrderSchedule[]

    @Field()
    customerPhoneNumber?: string
    @Field(types => Customer, { nullable: true })
    customer?: Customer
    @Field(types => [String])
    appliedRewards?: string[]
    @Field(types => Float)
    usedRewardsPoints?: number
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

    getPoints() {
        return sum(this.items?.map(item => (item.point || 0) * item.quantity));
    }

    getAppliedRewards(): string[] {
        // const itemDiscountInfo = this.items?.map(item => item.discount ?? []).flat()
        // const rewardIds = itemDiscountInfo.map(discount => discount.claimedRewardId ?? []).flat()
        // // get uniq reward ids using lodash helper method
        // return remove(rewardIds);
        return this.appliedRewards
    }

    generateOrderSchedules() {
        const schedules: OrderSchedule[] = [];

        this.items.forEach(item => {
            item.config?.forEach(config => {
                if (config.type === AddonInputType.DATE_INPUT || config.type === AddonInputType.DATE_TIME_INPUT) {
                    var keys = item.name.map(name => name.key) as LanguageKey[]
                    var note = []
                    console.log('order config info', config.singleValue, DateUtils.toDate(config.singleValue), note)
                    for (var key of keys) {
                        note.push(new LocalizedField({ key: key, value: `${LocalizedField.selectValueByKey(key, item.name)} - ${LocalizedField.selectValueByKey(key, config.name)}` }))
                    }
                    schedules.push(new OrderSchedule({
                        bookedTimes: [DateUtils.toDate(config.singleValue)], // Assuming singleValue holds the date
                        productId: item.productId,
                        orderId: this.id,
                        calendarId: config.calendarId,
                        note: note
                    })
                    );
                } else if (config.type === AddonInputType.DATE_RANGE_INPUT) {
                    config.multipleValue?.forEach(date => {
                        schedules.push(new OrderSchedule({
                            bookedTimes: [DateUtils.toDate(date)],
                            productId: item.productId,
                            orderId: this.id,
                            calendarId: config.calendarId,
                            note: note
                        }));
                    });
                }
            });
        });

        return schedules;
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

    createOrderFromOnlineStore(userId: string, businesseIds?: string[], branchId?: string) {
        // to do
        this.order.userId = userId;
        this.order.isOnlineOrder = true;
        this.order.status = OrderStatus.PENDING;
        this.order.businessId = businesseIds;
        this.order.branchId = branchId;
        return this;
    }

    createOrderFromPOS(businessId: string, customer?: Customer, branchId?: string) {
        this.order.userId = customer?.userId;
        this.order.branchId = branchId;
        this.order.businessId = [businessId]
        this.order.isOnlineOrder = false;
        this.order.status = OrderStatus.PENDING;
        return this;
    }

    withRewardInfo(appliedRewards: string[], usedRewardsPoints: number) {
        this.order.appliedRewards = appliedRewards;
        this.order.usedRewardsPoints = usedRewardsPoints;
        return this;
    }

    withItems(items: CreateOrderItemInput[], config?: CreateOrderConfigInput[]) {
        this.order.items = items.map(item => new OrderItem({
            name: item.name,
            quantity: item.quantity,
            branchId: item.branchId,
            image: item.image,
            productId: item.productId,
            subTotal: item.subTotal,
            point: item.point,
            discount: item.discount?.map(discount => new OrderItemDiscount(discount)),
            config: item.config?.map(config => new OrderConfig(config)),
        }));
        if (config) {
            this.order.config = config.map(config => new OrderConfig(config));
        }
        return this;
    }

    withPaymentInfo(paymentType: string, { remainingAmount, totalAmount, subtotal, paidAmount, paymentMethods, }: { remainingAmount?: number, totalAmount?: number, subtotal?: number, paidAmount?: number, paymentMethods?: OrderPaymentMethodInput[] }) {
        this.order.paymentType = paymentType;
        this.order.paymentMethods = paymentMethods?.map(paymentMethod => new OrderPaymentMethod(paymentMethod));
        this.order.subTotal = subtotal;
        this.order.totalAmount = totalAmount;
        this.order.remainingAmount = remainingAmount;
        this.order.paidAmount = paidAmount
        this.order.paymentMethods = paymentMethods?.map(paymentMethod => new OrderPaymentMethod(paymentMethod));
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

    withAdditionalInfo({ orderNumber, note, businessName }: { orderNumber?: number, note?: string, businessName?: LocalizedFieldInput[] }) {
        this.order.orderNumber = orderNumber;
        this.order.note = note;
        this.order.businessName = businessName?.map(name => new LocalizedField(name))
        this.order.code = this.generateOrderCode().toString();
        return this;
    }


    build() {
        return this.order;
    }

    generateOrderCode(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }
}

@ObjectType()
@Directive('@shareable')
export class OrderPaymentMethod {
    @Field(types => ID)
    id: string
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field(types => Price)
    amount: Price

    @Field({ defaultValue: false })
    requireReceiptImage: boolean
    @Field(types => [String])
    receiptImages?: string[]

    @Field()
    createdAt: Date
    @Field()
    updatedAt?: Date
    constructor(partial) {
        Object.assign(this, partial);
    }

    static createPaymentMethod(paymentMethod: OrderPaymentMethodInput) {
        return new OrderPaymentMethod({
            name: paymentMethod.name.map(name => new LocalizedField(name)),
            amount: new Price(paymentMethod.amount),
            requireReceiptImage: paymentMethod.requireReceiptImage,
            receiptImages: paymentMethod.receiptImages,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }
}

@ObjectType()
@Directive('@shareable')
export class PaymentMethodOption {
    @Field(types => ID)
    id: string
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field()
    account: String

    constructor(patial?: Partial<PaymentMethodOption>) {
        Object.assign(this, patial);
    }
}
registerEnumType(OrderType, { name: 'OrderType' })
registerEnumType(OrderStatus, { name: 'OrderStatus' })

function unique(rewardIds: string[]) {
    throw new Error("Function not implemented.");
}
