import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "../usecase/order.usecase";
import { Order } from "../model/order.model";
import { OrderResponse } from "../model/response/order.reponse";
import { CurrentUser } from "libs/common/get_user_decorator";
import { User } from "apps/auth/src/auth/model/user.model";
import { CreateCartInput } from "../dto/cart.input";
import { AuthzGuard } from "libs/common/authorization.guard";
import { UseGuards } from "@nestjs/common";
import { CreateOrderInput } from "../dto/order.input";
import { Customer } from "../customer/model/customer.model";
import { CustomerService } from "../customer/customer.service";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";


@Resolver(of => Order)
export class OrderResolver {
    constructor(private orderService: OrderService, private customerUseCase: CustomerService) { }

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

    @UseGuards(AuthzGuard)
    @Mutation(returns => OrderResponse)
    async placeOrderFromOnlineStore(@CurrentUser() user: User, @Args({ name: "businessIds", type: () => [String] }) businessIds: string[], @Args("orderInput") orderInput: CreateOrderInput, @Args({ name: "cartId", nullable: true }) cartId?: string): Promise<OrderResponse> {
        const result = await this.orderService.placeOrderForBusiness(user, businessIds, orderInput);
        return result;
    }

    // @UseGuards(AuthzGuard)
    @Mutation(returns => OrderResponse)
    async placeOrderFromPOS(@Args('businessId') businessId: string, @Args("orderInput") orderInput: CreateOrderInput, @Args({ name: "customerId", nullable: true }) customerId?: string): Promise<OrderResponse> {
        console.log('orderInput', orderInput.paymentMethods)
        const result = await this.orderService.placeOrderFromPOS(businessId, orderInput, customerId);
        return result;
    }

    @UseGuards(AuthzGuard)
    @Query(returns => OrderResponse)
    async getUserOrders(@CurrentUser() user: User): Promise<OrderResponse> {
        const result = await this.orderService.getUserOrders(user.id);
        return result;
    }

    @UseGuards(AuthzGuard)
    @Query(returns => OrderResponse)
    async getOrderDetails(@Args("orderId") orderId: string): Promise<OrderResponse> {
        const result = await this.orderService.getOrderDetails(orderId);
        return result;
    }

    // @RequiresPermission({
    //     permissions: [
    //         { resourceType: AppResources.POS, action: PERMISSIONACTION.ANY },
    //         { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
    //     ],
    // })
    // @UseGuards(PermissionGuard)
    @Query(returns => OrderResponse)
    async getBranchOrders(@Args("branchId") branchId: string): Promise<OrderResponse> {
        const result = await this.orderService.getBranchOrders(branchId);
        return result;
    }

    @Mutation(returns => OrderResponse)
    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" },
            { resourceType: AppResources.BRANCH, action: PERMISSIONACTION.MANAGE, resourcTargetName: "branchId" },
        ],
    })
    @UseGuards(PermissionGuard)
    async updateOrderStatus(@Args("businessId") businessId: string, @Args("orderId") orderId: string, @Args("status") status: string, @Args({ name: "branchId", nullable: true }) branchId?: string): Promise<OrderResponse> {
        const result = await this.orderService.updateOrderStatus(orderId, status);
        return result;
    }
}