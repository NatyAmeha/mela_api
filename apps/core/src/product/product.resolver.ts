import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Product } from "./model/product.model";
import { ProductService } from "./product.service";
import { BuilkProductCreateInput, CreateProductInput, UpdateProductInput } from "./dto/product.input";
import { ProductResponse, ProductResponseBuilder } from "./model/product.response";
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
import { plainToClass, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";
import { CreateBundleInput, UpdateBundleInput } from "./dto/product_bundle.input";
import { BundleResponse } from "./dto/bundle_response";
import { BundleService } from "./bundle.service";

@Resolver(of => Product)
export class ProductResolver {
    constructor(
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient,
        private productService: ProductService,
        private businessService: BusinessService,
        private branchService: BranchService,
        private bundleService: BundleService,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator
    ) {
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.CREATE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse, { description: "Create products with varaints. returns list of products created. inside products field" })
    async createBusinessProducts(@Args("businessId") businessId: string, @Args({ name: 'productInfo', type: () => [CreateProductInput] }) productInfo: CreateProductInput[]): Promise<ProductResponse> {
        await this.inputValidator.validateArrayInput(productInfo, CreateProductInput)
        let businessSubscriptionResponse = await this.coreServiceMsgBrocker.getBusinessSubscription(businessId);
        if (!businessSubscriptionResponse || !businessSubscriptionResponse.success) {
            return new ProductResponseBuilder().withError(businessSubscriptionResponse.message)
        }
        var productResult = await this.productService.createProducts(businessId, productInfo, businessSubscriptionResponse.data.subscription, businessSubscriptionResponse.data.platformServices);
        return productResult;
    }

    @Query(returns => ProductResponse, { description: "Get product details with inventory, variants" })
    async getProductDetail(
        @Args("productId") productId: string,
        @Args({ name: "branchId", nullable: true }) branchId?: string,
        @Args({ name: "locationId", nullable: true }) locationId?: string,
    ): Promise<ProductResponse> {
        let branchInfo: Branch
        if (branchId) {
            branchInfo = await this.branchService.getBranch(branchId);
        }
        const productDetailResult = await this.productService.getProductDetailsWithInventory(productId, locationId, branchInfo);
        return productDetailResult;
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.CREATE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BundleResponse, { description: "returns the created bundle inside bundle field of the response object" })
    async createBundle(@Args("businessId") businessId: string, @Args({ name: "branchIds", type: () => [String] }) branchIds: string[], @Args("bundle") bundle: CreateBundleInput): Promise<BundleResponse> {
        // let businessSubscriptionResponse = await this.coreServiceMsgBrocker.getBusinessSubscription(businessId);
        // if (!businessSubscriptionResponse || !businessSubscriptionResponse.success) {
        //     return {
        //         success: false,
        //         message: businessSubscriptionResponse.message
        //     }
        // }
        // let subscriptionInfo = businessSubscriptionResponse.data;
        let bundleResult = await this.bundleService.createProductBundle(businessId, branchIds, bundle);
        return bundleResult;
    }


    @Query(returns => BundleResponse, { description: "Get bundle details with products, business, and branches info" })
    async getBundleDetail(@Args("bundleId") bundleId: string): Promise<BundleResponse> {
        let bundleResult = await this.bundleService.getBundleDetails(bundleId);
        return bundleResult;
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.UPDATE, resourcTargetName: "bundleId" },
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BundleResponse, { description: "returns the updated bundle inside bundle field of the response object" })
    async updateBundle(@Args("businessId") businessId: string, @Args("bundleId") bundleId: string, @Args("bundleData") bundleData: UpdateBundleInput): Promise<BundleResponse> {
        let bundleResult = await this.bundleService.updateBundleInfo(businessId, bundleId, bundleData);
        return bundleResult;
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.UPDATE, resourcTargetName: "bundleId" },
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BundleResponse, { description: "returns the updated bundle inside bundle field of the response object" })
    async addProductToBundle(@Args("businessId") businessId: string, @Args("bundleId") bundleId: string, @Args({ name: "productIds", type: () => [String] }) productIds: string[]): Promise<BundleResponse> {
        let bundleResult = await this.bundleService.addProductToBundle(bundleId, productIds);
        return bundleResult;
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.UPDATE, resourcTargetName: "bundleId" },
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BundleResponse, { description: "returns the updated bundle inside bundle field of the response object" })
    async removeProductFromBundle(@Args("businessId") businessId: string, @Args("bundleId") bundleId: string, @Args({ name: "productIds", type: () => [String] }) productIds: string[]): Promise<BundleResponse> {
        let bundleResult = await this.bundleService.removeProductFromBundle(bundleId, productIds);
        return bundleResult;
    }

    // @RequiresPermission({
    //     permissions: [
    //         { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.DELETE, resourcTargetName: "bundleId" },
    //         { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" },
    //         { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" }
    //     ],
    // })
    // @UseGuards(PermissionGuard)
    // @Mutation(returns => BundleResponse, { description: "returns the updated bundle inside bundle field of the response object" })
    // async deleteBundle(@Args("businessId") businessId: string, @Args("bundleId") bundleId: string): Promise<BundleResponse> {
    //     let bundleResult = await this.bundleService.deleteBundle(bundleId);
    //     return bundleResult;
    // }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.UPDATE, resourcTargetName: "bundleId" },
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BundleResponse, { description: "returns the updated bundle inside bundle field of the response object" })
    async addProductBundleToBranch(@Args("businessId") businessId: string, @Args("bundleId") bundleId: string, @Args({ name: "branchIds", type: () => [String] }) branchIds: string[]): Promise<BundleResponse> {
        let bundleResult = await this.bundleService.addBundleToBranch(bundleId, branchIds);
        return bundleResult;
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.READ, resourcTargetName: "bundleId" },
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BundleResponse, { description: "returns the updated bundle inside bundle field of the response object" })
    async removeBundleFromBranch(@Args("businessId") businessId: string, @Args("bundleId") bundleId: string, @Args({ name: "branchIds", type: () => [String] }) branchIds: string[]): Promise<BundleResponse> {
        let bundleResult = await this.bundleService.removeBundleFromBranch(bundleId, branchIds);
        return bundleResult;
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.DELETE, resourcTargetName: "bundleId" },
            { resourceType: AppResources.BUNDLE, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BundleResponse)
    async deleteProductBundle(@Args("businessId") businessId: string, @Args('bundleId') bundleId: string): Promise<BundleResponse> {
        let bundleResponse = await this.bundleService.deleteBundle(bundleId);
        return bundleResponse;
    }




    // @RequiresPermission({
    //     permissions: [
    //         { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.CREATE },
    //         { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY }
    //     ],
    // })
    // @UseGuards(PermissionGuard)
    // @Mutation(returns => ProductResponse)
    // async createBulkProducts(@Args("businessId") businessId: string, products: BuilkProductCreateInput[]): Promise<ProductResponse> {
    //     let businessSubscriptionResponse = await this.coreServiceMsgBrocker.getBusinessSubscription(businessId);
    //     if (!businessSubscriptionResponse || !businessSubscriptionResponse.success) {
    //         return {
    //             success: false,
    //             message: businessSubscriptionResponse.message
    //         }
    //     }
    //     let subscriptionInfo = businessSubscriptionResponse.data;
    //     var bulkCreateResponse = await this.productService.createBulkProducts(businessId, products, subscriptionInfo.subscription, subscriptionInfo.platformServices);
    //     return bulkCreateResponse;
    // }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.UPDATE, resourcTargetName: "productId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @Mutation(returns => ProductResponse)
    async updateBusinessProductInfo(@Args("businessId") businessId: string, @Args('productId') productId: string, @Args('product') product: UpdateProductInput): Promise<ProductResponse> {
        var productResult = await this.productService.updateProduct(productId, product.getProductInfoToBeUpdated());
        return {
            success: true,
            product: productResult
        }
    }


    @Mutation(returns => ProductResponse)
    async getBusinessProducts(@Args("businessId") businessId: string, @Args("page", { nullable: true }) page?: number, @Args("limit", { nullable: true }) limit?: number): Promise<ProductResponse> {
        let productResult = await this.productService.getBusinessProducts(businessId, { page, limit });
        return new ProductResponseBuilder().withProducts(productResult).build();
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.ASSIGN_UNASSIGN, resourcTargetName: "branchIds" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse)
    async addProductToBranch(@Args("businessId") businessId: string, @Args('productIds', { type: () => [String] }) productId: string[], @Args('branchIds', { type: () => [String] }) branchId: string[]): Promise<ProductResponse> {
        var updatedProducts = await this.productService.addProductToBranch(productId, branchId);
        return new ProductResponseBuilder().withProducts(updatedProducts).build();
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.ASSIGN_UNASSIGN, resourcTargetName: "branchIds" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse)
    async removeProductFromBranch(@Args("businessId") businessId: string, @Args('productIds', { type: () => [String] }) productId: string[], @Args('branchIds', { type: () => [String] }) branchId: string[]): Promise<ProductResponse> {
        var updatedProducts = await this.productService.removeProductFromBranch(productId, branchId);
        return {
            success: true,
            products: updatedProducts
        }
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.DELETE, resourcTargetName: "productId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse, { description: "Returns boolean value to indicate the payment option is assigned to product" })
    async assignPaymentOptionToProduct(@Args("businessId") businessId: string, @Args('productId') productId: string, @Args({ name: "paymentOptionId", type: () => [String] }) paymentOptionsId: string[]): Promise<ProductResponse> {
        const selectedBusinessPaymentOptions = await this.businessService.getBusinessPaymentOptions(businessId, paymentOptionsId);
        const isPaymentOptionsExistOnBusiness = selectedBusinessPaymentOptions.length === paymentOptionsId.length;
        if (!isPaymentOptionsExistOnBusiness) {
            return new ProductResponseBuilder().withError("Payment options not found on business");
        }
        return await this.productService.assignPaymentOptions(productId, paymentOptionsId);
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.DELETE, resourcTargetName: "productId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse)
    async removePaymentOptionFromProduct(@Args("businessId") businessId: string, @Args('productId') productId: string, @Args({ name: "paymentOptionId", type: () => [String] }) paymentOptionsId: string[]): Promise<ProductResponse> {
        return await this.productService.removePaymentOptions(productId, paymentOptionsId);
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
