import { Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Product } from "./model/product.model";
import { ProductService } from "./product.service";
import { CreateProductInput, UpdateProductInput } from "./dto/product.input";
import { ProductResponse } from "./model/product.response";
import { Branch } from "../branch/model/branch.model";
import { BranchService } from "../branch/usecase/branch.service";
import { BusinessService } from "../business/usecase/business.service";
import { Business } from "../business/model/business.model";
import { Inject, UseGuards } from "@nestjs/common";
import { AuthzGuard } from "libs/common/authorization.guard";
import { PermissionSelectionCriteria, RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { PlatformServiceSubscription, PlatformServices } from "libs/common/get_user_decorator";
import { PlatformServiceGateway, SubscriptionGateway } from "apps/mela_api/src/model/subscription.gateway.model";
import { CoreServiceMsgBrockerClient } from "../msg_brocker_client/core_service_msg_brocker";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";

@Resolver(of => Product)
export class ProductResolver {
    constructor(
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient,
        private productService: ProductService,
        private businessService: BusinessService,
        private branchService: BranchService
    ) {
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.CREATE },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY }
        ],
        selectionCriteria: PermissionSelectionCriteria.ANY
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse)
    async createBusinessProduct(@Args("businessId") businessId: string, @Args('productInfo') product: CreateProductInput): Promise<ProductResponse> {
        let productCreateInfo = product.toProduct(businessId);
        let businessSubscriptionResponse = await this.coreServiceMsgBrocker.getBusinessSubscription(businessId);
        if (!businessSubscriptionResponse || !businessSubscriptionResponse.success) {
            return {
                success: false,
                message: businessSubscriptionResponse.message
            }
        }
        let subscriptionInfo = businessSubscriptionResponse.data;
        var productResult = await this.productService.createProduct(productCreateInfo, subscriptionInfo.subscription, subscriptionInfo.platformServices);
        return productResult;
    }

    @Mutation(returns => ProductResponse)
    async updateProduct(@Args('productId') productId: string, @Args('product') product: UpdateProductInput): Promise<ProductResponse> {
        var productResult = await this.productService.updateProduct(productId, product.getProductInfoToBeUpdated());
        return {
            success: true,
            product: productResult
        }
    }

    @Mutation(returns => ProductResponse)
    async addProductToBranch(@Args('productIds', { type: () => [String] }) productId: string[], @Args('branchIds', { type: () => [String] }) branchId: string[]): Promise<ProductResponse> {
        var updatedProducts = await this.productService.addProductToBranch(productId, branchId);
        return {
            success: true,
            products: updatedProducts
        }
    }

    @Mutation(returns => ProductResponse)
    async removeProductFromBranch(@Args('productIds', { type: () => [String] }) productId: string[], @Args('branchIds', { type: () => [String] }) branchId: string[]): Promise<ProductResponse> {
        var updatedProducts = await this.productService.removeProductFromBranch(productId, branchId);
        return {
            success: true,
            products: updatedProducts
        }
    }

    // ------------------ Nested Queries ------------------

    // responsd for nested query of business from product type
    @ResolveField('business', returns => Business)
    async getBusinessForProduct(@Parent() product: Product): Promise<Business> {
        return await this.businessService.getProductBusiness(product.id);
    }

    // responsd for nested query of branches for product  from product type
    @ResolveField('branches', returns => [Branch])
    async branches(@Parent() product: Product): Promise<Branch[]> {
        return await this.branchService.getProductBranchs(product.id);
    }


}
