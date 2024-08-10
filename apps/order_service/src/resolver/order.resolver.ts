import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "../usecase/order.usecase";
import { Order } from "../model/order.model";
import { OrderResponse } from "../dto/response/order.reponse";
import { CurrentUser } from "libs/common/get_user_decorator";
import { User } from "apps/auth/src/auth/model/user.model";
import { CreateCartInput } from "../dto/cart.input";
import { AuthzGuard } from "libs/common/authorization.guard";
import { UseGuards } from "@nestjs/common";


@Resolver(of => Order)
export class OrderResolver {
    constructor(private orderService: OrderService) { }

    @UseGuards(AuthzGuard)
    @Mutation(returns => OrderResponse)
    async addToBusinessCart(@Args("businessId") businessId: string, @CurrentUser() userInfo: User, @Args("cartInput") cartInput: CreateCartInput): Promise<OrderResponse> {
        const result = await this.orderService.addToBusinessCart(businessId, userInfo?.id, cartInput);
        return result;
    }

    @UseGuards(AuthzGuard)
    @Mutation(returns => OrderResponse)
    async removeItemsFromCart(@Args("cartId") cartId: string, @CurrentUser() user: User, @Args("productIds", { type: () => [String] }) productIds: string[]): Promise<OrderResponse> {
        const result = await this.orderService.removeItemsFromCart(cartId, user.id, productIds);
        return result;
    }

    @UseGuards(AuthzGuard)
    @Query(returns => OrderResponse)
    async getUserCarts(@CurrentUser() user: User): Promise<OrderResponse> {
        const result = await this.orderService.getUserCarts(user.id);
        return result;
    }
}