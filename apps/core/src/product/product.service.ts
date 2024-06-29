import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository, ProductRepository } from "./repo/product.repository";
import { Product } from "./model/product.model";
import { ProductResourceUsageTracker } from "../resource_usage_tracker/product_resource_usage";
import { ProductResponse, ProductResponseBuilder } from "./model/product.response";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PlatformSubscriptionBuilder, Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformService } from "apps/subscription/src/model/platform_service.model";
import { BuilkProductCreateInput, CreateProductInput } from "./dto/product.input";
import { CommonBusinessErrorMessages, CommonProductErrorMessages, CommonSubscriptionErrorMessages } from "../utils/const/error_constants";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { plainToClass } from "class-transformer";
import { InventoryLocationRepository } from "../inventory/repo/inventory_location.repository";
import { InventoryRepository } from "../inventory/repo/inventory.repository";
import { Branch } from "../branch/model/branch.model";
import { CreateProductAddonInput, UpdateProductAddonInput } from "./dto/product_addon.input";
import { ProductAddon } from "./model/product_addon.model";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";

@Injectable()
export class ProductService {
    constructor(
        @Inject(ProductRepository.injectName) private productRepository: IProductRepository,
        @Inject(ProductResourceUsageTracker.injectName) private productUsageTracker: ProductResourceUsageTracker,
        @Inject(InventoryRepository.injectName) private inventoryRepo: InventoryRepository,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator



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

    async getProductDetailsWithInventory(productId: string, locationId?: string, branchInfo?: Branch): Promise<ProductResponse> {
        const productInfo = await this.productRepository.getProductById(productId);
        if (!productInfo) {
            throw new RequestValidationException({ message: "Product not found", statusCode: 400 });
        }
        // const inventoryLocationIds = branchInfo?.getInventoryLocationIds()
        // will be refactored to get accurate product inventory info
        const productInventories = await this.inventoryRepo.getProductInventories(productId, locationId);
        let response = new ProductResponseBuilder().withProduct(productInfo).withinventories(productInventories);
        if (productInfo.mainProduct && productInfo?.variantsId?.length > 0) {
            const productVariants = await this.productRepository.getProductsById(productInfo.variantsId);
            response.withProductVariants(productVariants, branchInfo);
        }
        return response.build()
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

    async createProductAddon(productId: string, addons: CreateProductAddonInput[]): Promise<ProductResponse> {
        await this.inputValidator.validateArrayInput(addons, CreateProductAddonInput);
        const productInfo = await this.productRepository.getProductById(productId);
        if (!productInfo) {
            return new ProductResponseBuilder().withError(CommonProductErrorMessages.PRODUCT_NOT_FOUND);
        }
        const productAddons = addons.map(addon => ProductAddon.fromCreateProductAddon(addon));
        const isAddonExist = await this.isAddonExistInProduct(productInfo, productAddons);
        if (isAddonExist) {
            return new ProductResponseBuilder().withError(CommonProductErrorMessages.ADDON_ALREADY_EXIST);
        }
        const result = await this.productRepository.createProductAddon(productId, productAddons);
        return new ProductResponseBuilder().basicResponse(result)
    }

    async updateProductAddon(productId: string, updatedAddons: UpdateProductAddonInput[]) {
        await this.inputValidator.validateArrayInput(updatedAddons, UpdateProductAddonInput);
        const productAddons = updatedAddons?.map(addon => ProductAddon.fromCreateProductAddon(addon));
        const result = await this.productRepository.updateProductAddon(productId, productAddons)
        return new ProductResponseBuilder().basicResponse(result)
    }

    async deleteProductAddon(productId: string, addonId: string) {
        const result = await this.productRepository.deleteProductAddon(productId, addonId);
        return new ProductResponseBuilder().basicResponse(result);
    }

    async deleteAllAddons(productId: string) {
        const result = await this.productRepository.deleteAllProductAddon(productId);
        return new ProductResponseBuilder().basicResponse(result);
    }

    async assignPaymentOptions(productId: string, paymentOptionsId: string[]): Promise<ProductResponse> {
        const result = await this.productRepository.assignPaymentOptionToProduct(productId, paymentOptionsId);
        return new ProductResponseBuilder().basicResponse(result);
    }

    async removePaymentOptions(productId: string, paymentOptionId: string[]): Promise<ProductResponse> {
        const result = await this.productRepository.removePaymentOptionFromProduct(productId, paymentOptionId);
        return new ProductResponseBuilder().basicResponse(result);
    }

    async isAddonExistInProduct(productInfo: Product, newAddons: ProductAddon[]): Promise<boolean> {
        const productAddons = productInfo.addons;
        return newAddons.some(newAddon => {
            return productAddons.some(addon => {
                return this.inputValidator.isObjectAreEqual(newAddon.name.map(name => name.value), addon.name.map(name => name.value))
            });
        })
    }


}