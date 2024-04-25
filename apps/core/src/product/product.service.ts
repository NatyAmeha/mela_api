import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository, ProductRepository } from "./repo/product.repository";
import { Product } from "./model/product.model";
import { ProductResourceUsageTracker } from "../resource_usage_tracker/product_resource_usage";
import { ProductResponse } from "./model/product.response";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PlatformSubscriptionBuilder, Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformService } from "apps/subscription/src/model/platform_service.model";

@Injectable()
export class ProductService {
    constructor(
        @Inject(ProductRepository.injectName) private productRepository: IProductRepository,
        @Inject(ProductResourceUsageTracker.injectName) private productUsageTracker: ProductResourceUsageTracker
    ) {
    }
    async createProduct(productInput: Product, subscriptionInput: Subscription, platformServices: PlatformService[]): Promise<ProductResponse> {

        if (subscriptionInput == undefined || !platformServices || platformServices?.length == 0) {
            throw new RequestValidationException({ message: "No subscription information found" })
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

    async getBusinessProducts(businessId: string): Promise<Product[]> {
        return await this.productRepository.getBusinessProducts(businessId);
    }
}