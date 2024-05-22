import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository, ProductRepository } from "./repo/product.repository";
import { Product } from "./model/product.model";
import { ProductResourceUsageTracker } from "../resource_usage_tracker/product_resource_usage";
import { ProductResponse, ProductResponseBuilder } from "./model/product.response";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PlatformSubscriptionBuilder, Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformService } from "apps/subscription/src/model/platform_service.model";
import { BuilkProductCreateInput, CreateProductInput } from "./dto/product.input";
import { CommonBusinessErrorMessages, CommonSubscriptionErrorMessages } from "../utils/const/error_constants";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { plainToClass } from "class-transformer";

@Injectable()
export class ProductService {
    constructor(
        @Inject(ProductRepository.injectName) private productRepository: IProductRepository,
        @Inject(ProductResourceUsageTracker.injectName) private productUsageTracker: ProductResourceUsageTracker
    ) {
    }
    async createProducts(businessId: string, productInput: CreateProductInput[], subscriptionInput: Subscription, platformServices: PlatformService[]): Promise<ProductResponse> {
        const productsInfos = await Promise.all(productInput?.map((product) => Product.fromCreateProductInput(businessId, product)));
        const subscriptionInstance = Subscription.toSubscriptionInstance(subscriptionInput)
        let productUsageTracker = await this.productUsageTracker.getBusinessProductCreationUsage(businessId, subscriptionInstance, platformServices);
        if (!productUsageTracker.success) {
            return new ProductResponseBuilder().withError(productUsageTracker.message);
        }
        if (productUsageTracker.isExceededMaxUsage(productsInfos.length)) {
            return new ProductResponse({ success: false, message: "You have reached the maximum number of products you can create." })
        }
        console.log("productUsageTracker", productUsageTracker)
        let createdProducts = await this.productRepository.createProductsWithVariants(productsInfos);
        return new ProductResponseBuilder().withProducts(createdProducts).build();
    }

    // async createBulkProducts(businessId: string, products: BuilkProductCreateInput[], subscriptionInput: Subscription, platformServices: PlatformService[]): Promise<ProductResponse> {
    //     const productInfos = await Promise.all(products.map(async (product) => (Product.fromCreateProductInput(businessId, product));
    //     if (subscriptionInput == undefined || !platformServices || platformServices?.length == 0) {
    //         throw new RequestValidationException({ message: CommonSubscriptionErrorMessages.SUBSCRIPTION_NOT_FOUND })
    //     }
    //     let subscriptionInfo = new PlatformSubscriptionBuilder(platformServices).fromSubscriptionObject(subscriptionInput)
    //     let productUsageTracker = await this.productUsageTracker.getBusinessProductCreationUsage(businessId, subscriptionInfo, platformServices);
    //     if (productUsageTracker.isExceededMaxUsage(productInfos.length)) {
    //         return new ProductResponseBuilder().withError(CommonBusinessErrorMessages.MAX_PRODUCT_CREATION_EXCEEDED);
    //     }
    //     let createdProducts = await this.productRepository.createProductsWithVariants(productInfos);
    //     return new ProductResponseBuilder().withProducts(createdProducts).build();
    // }

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