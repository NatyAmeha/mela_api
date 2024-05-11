import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository, ProductRepository } from "./repo/product.repository";
import { Product } from "./model/product.model";
import { ProductResourceUsageTracker } from "../resource_usage_tracker/product_resource_usage";
import { ProductResponse, ProductResponseBuilder } from "./model/product.response";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PlatformSubscriptionBuilder, Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformService } from "apps/subscription/src/model/platform_service.model";
import { BuilkProductCreateInput } from "./dto/product.input";
import { CommonBusinessErrorMessages, CommonSubscriptionErrorMessages } from "../utils/const/error_constants";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";

@Injectable()
export class ProductService {
    constructor(
        @Inject(ProductRepository.injectName) private productRepository: IProductRepository,
        @Inject(ProductResourceUsageTracker.injectName) private productUsageTracker: ProductResourceUsageTracker
    ) {
    }
    async createProduct(productInput: Product, subscriptionInput: Subscription, platformServices: PlatformService[]): Promise<ProductResponse> {

        if (subscriptionInput == undefined || !platformServices || platformServices?.length == 0) {
            throw new RequestValidationException({ message: CommonSubscriptionErrorMessages.SUBSCRIPTION_NOT_FOUND })
        }
        let subscriptionInfo = new PlatformSubscriptionBuilder(platformServices).fromSubscriptionObject(subscriptionInput)
        let productUsageTracker = await this.productUsageTracker.getBusinessProductCreationUsage(productInput.businessId, subscriptionInfo, platformServices);
        console.log("productUsageTracker", productUsageTracker)
        if (productUsageTracker.isAtMaxUsage()) {
            return new ProductResponse({ success: false, message: "You have reached the maximum number of products you can create." })
        }
        let product = await this.productRepository.createProduct(productInput);
        return new ProductResponse({ success: true, product: product, })
    }

    async createBulkProducts(businessId: string, products: BuilkProductCreateInput[], subscriptionInput: Subscription, platformServices: PlatformService[]): Promise<ProductResponse> {
        let productInfos = products.map((product) => product.toProduct(businessId));
        if (subscriptionInput == undefined || !platformServices || platformServices?.length == 0) {
            throw new RequestValidationException({ message: CommonSubscriptionErrorMessages.SUBSCRIPTION_NOT_FOUND })
        }
        let subscriptionInfo = new PlatformSubscriptionBuilder(platformServices).fromSubscriptionObject(subscriptionInput)
        let productUsageTracker = await this.productUsageTracker.getBusinessProductCreationUsage(businessId, subscriptionInfo, platformServices);
        if (productUsageTracker.isExceededMaxUsage(productInfos.length)) {
            return new ProductResponseBuilder().withError(CommonBusinessErrorMessages.MAX_PRODUCT_CREATION_EXCEEDED);
        }
        let createdProducts = await this.productRepository.createBulkProducts(businessId, productInfos);
        return new ProductResponseBuilder().withProducts(createdProducts).build();
    }

    async updateProduct(productId: string, productInfo: Partial<Product>): Promise<Product> {
        return this.productRepository.updateProduct(productId, productInfo);
    }

    async addProductToBranch(productId: string[], branchId: string[]): Promise<Product[]> {
        return await this.productRepository.addProductToBranch(productId, branchId);
    }

    async removeProductFromBranch(productId: string[], branchId: string[]): Promise<Product[]> {
        return await this.productRepository.removeProductFromBranch(productId, branchId);
    }

    async getBranchProducts(branchId: string): Promise<Product[]> {
        return await this.productRepository.getBranchProducts(branchId);
    }

    async getBusinessProducts(businessId: string, query: QueryHelper<Product>): Promise<Product[]> {
        return await this.productRepository.getBusinessProducts(businessId, query);
    }
}