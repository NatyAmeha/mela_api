import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository, ProductRepository } from "./repo/product.repository";
import { Product, ProductInput } from "./model/product.model";
import { ProductResourceUsageTracker } from "../resource_usage_tracker/product_resource_usage";
import { ProductResponse } from "./model/product.response";
import { AppResourceAction } from "apps/auth/src/authorization/model/access.model";
import { PlatformServiceGateway, SubscriptionGateway } from "apps/mela_api/src/model/subscription.gateway.model";

@Injectable()
export class ProductService {
    constructor(
        @Inject(ProductRepository.injectName) private productRepository: IProductRepository,
        @Inject(ProductResourceUsageTracker.injectName) private productUsageTracker: ProductResourceUsageTracker
    ) {
    }
    async createProduct(productInput: ProductInput, subscriptionInfo: SubscriptionGateway, platformServices: PlatformServiceGateway[]): Promise<ProductResponse> {
        let productUsageTracker = await this.productUsageTracker.getBusinessProductCreationUsage(productInput.businessId, subscriptionInfo, platformServices);
        if (productUsageTracker.isAtMaxUsage()) {
            return new ProductResponse({ success: false, message: "You have reached the maximum number of products you can create." })
        }
        let product = await this.productRepository.createProduct(productInput.toProduct());
        return new ProductResponse({ product: product })
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