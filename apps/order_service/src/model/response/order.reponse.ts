import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Cart } from "../cart.model";
import { Order } from "../order.model";
import { types } from "joi";
import { OrderSchedule } from "../order_schedule.model";
import { AddonUsage } from "../addon_usage.model";

@ObjectType()
export class OrderResponse extends BaseResponse {
    @Field(types => Cart)
    cart?: Cart

    @Field(types => [Cart])
    carts?: Cart[]

    @Field(types => Order)
    order?: Order
    @Field(types => [Order])
    orders?: Order[]

    @Field(types => [OrderSchedule])
    schedules?: OrderSchedule[]

    @Field(types => [AddonUsage])
    addonUsages?: AddonUsage[]

    constructor(data: Partial<OrderResponse>) {
        super()
        Object.assign(this, data)
    }
}

export class OrderResponseBuilder extends BaseResponseBuilder {
    constructor(private orderResponse: OrderResponse = new OrderResponse({})) {
        super(orderResponse);
    }

    withError(error: string): OrderResponse {
        this.orderResponse.success = false
        this.orderResponse.message = error
        return this.orderResponse;
    }

    withOrder(order: Order): OrderResponseBuilder {
        this.orderResponse.success = true
        this.orderResponse.message = 'Order created successfully'
        this.orderResponse.order = order
        return this
    }

    withOrders(orders: Order[]): OrderResponseBuilder {
        this.orderResponse.success = true
        this.orderResponse.orders = orders
        return this
    }

    withCart(cart: Cart): OrderResponseBuilder {
        this.orderResponse.success = true
        this.orderResponse.cart = cart
        return this
    }

    withCarts(carts: Cart[]): OrderResponseBuilder {
        this.orderResponse.success = true
        this.orderResponse.carts = carts
        return this
    }

    withSchedules(schedules: OrderSchedule[]): OrderResponseBuilder {
        this.orderResponse.success = true
        this.orderResponse.schedules = schedules
        return this
    }

    withAddonUsages(addonUsages: AddonUsage[]): OrderResponseBuilder {
        this.orderResponse.success = true
        this.orderResponse.addonUsages = addonUsages;
        return this;
    }

    build(): OrderResponse {
        return this.orderResponse
    }
}