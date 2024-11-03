import { LocalizedField } from "@app/common/model/localized_model"
import { Directive, Field, Float, ID, Int, ObjectType } from "@nestjs/graphql"
import { OrderItemDiscountInput } from "../dto/order_item.input"
import { OrderConfig } from "./order.config.model"

@ObjectType()
@Directive('@shareable')
export class OrderItem {
    @Field(types => ID)
    id: string
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field(types => Float)
    quantity: number
    @Field()
    branchId?: string
    @Field()
    image: string
    @Field()
    productId: string
    @Field()
    subTotal: number
    @Field()
    tax?: number
    @Field(types => [OrderItemDiscount])
    discount?: OrderItemDiscount[]
    @Field(type => [OrderConfig])
    config?: OrderConfig[]
    @Field(type => Float)
    point?: number
    @Field()
    createdAt?: Date
    @Field()
    updatedAt?: Date
    constructor(partial?: Partial<OrderItem>) {
        Object.assign(this, partial)
    }
}

@ObjectType()
@Directive('@shareable')
export class OrderItemDiscount {
    @Field(types => ID)
    id: string
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field(types => Float)
    amount: number
    @Field(types => [String])
    claimedRewardId?: string[]

    constructor(partial?: Partial<OrderItemDiscount>) {
        Object.assign(this, partial)
    }

    static fromCreateOrderItemDiscount(orderItemDiscount: OrderItemDiscountInput) {
        return new OrderItemDiscount({
            ...orderItemDiscount,
            name: orderItemDiscount.name?.map(name => new LocalizedField(name)),
        })
    }
}