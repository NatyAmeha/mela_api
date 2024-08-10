import { LocalizedField } from "@app/common/model/localized_model"
import { OrderItem } from "./order_item.model"
import { Directive, Field, ID, ObjectType } from "@nestjs/graphql"
import { CreateOrderItemInput } from "../dto/order_item.input"
import { CreateCartInput } from "../dto/cart.input"

@ObjectType()
@Directive('@shareable')
export class Cart {
    @Field(types => ID)
    id: string
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field()
    businessId: string
    @Field()
    userId: string
    @Field(types => [OrderItem])
    items: OrderItem[]
    @Field()
    createdAt?: Date
    @Field()
    updatedAt?: Date
    constructor(partial?: Partial<Cart>) {
        Object.assign(this, partial)
    }

    static createCartInfo(businessId: string, userId: string, cartInfo: CreateCartInput) {
        return new Cart({
            businessId,
            userId,
            name: cartInfo.name.map(name => new LocalizedField(name)),
            items: cartInfo.items.map(item => new OrderItem({
                name: item.name,
                quantity: item.quantity,
                branchId: item.branchId,
                image: item.image,
                productId: item.productId,
                subTotal: item.subTotal,
                // discount: item.discount
            })),

            updatedAt: new Date(Date.now()),
        });
    }
}