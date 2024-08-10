import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Cart } from "../../model/cart.model";
import { Order } from "../../model/order.model";

@ObjectType()
export class OrderResponse extends BaseResponse {
    @Field(types => Cart)
    cart?: Cart
    @Field()
    order?: Order
    @Field(types => [Order])
    orders?: Order[]

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

    build(): OrderResponse {
        return this.orderResponse
    }
}