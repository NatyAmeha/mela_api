import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository, ProductRepository } from "../repo/product.repository";
import { Product } from "../model/product.model";
import { ProductResourceUsageTracker } from "../../resource_usage_tracker/product_resource_usage";
import { ProductResponse, ProductResponseBuilder } from "../model/product.response";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PlatformSubscriptionBuilder, Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformService } from "apps/subscription/src/model/platform_service.model";
import { BuilkProductCreateInput, CreateProductInput } from "../dto/product.input";
import { CommonBusinessErrorMessages, CommonProductErrorMessages, CommonSubscriptionErrorMessages } from "../../utils/const/error_constants";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { plainToClass } from "class-transformer";
import { InventoryLocationRepository } from "../../inventory/repo/inventory_location.repository";
import { InventoryRepository } from "../../inventory/repo/inventory.repository";
import { Branch } from "../../branch/model/branch.model";
import { CreateProductAddonInput, UpdateProductAddonInput } from "../dto/product_addon.input";
import { ProductAddon } from "../model/product_addon.model";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";
import { ProductPriceRepository } from "../repo/product_price.repository";
import { CreateProductPriceInput, UpdateProductPriceInput } from "../dto/product_price.input";
import { ProductPrice } from "../model/product_price.model";
import { BranchResponse } from "../../branch/model/branch.response";
import { ProductBundle } from "../model/product_bundle.model";
import { Inventory } from "../../inventory/model/inventory.model";

@Injectable()
export class ProductService {
    constructor(
        @Inject(ProductRepository.injectName) private productRepository: IProductRepository,
        @Inject(ProductPriceRepository.injectName) private productPriceRepo: ProductPriceRepository,
        @Inject(ProductResourceUsageTracker.injectName) private productUsageTracker: ProductResourceUsageTracker,
        @Inject(InventoryRepository.injectName) private inventoryRepo: InventoryRepository,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator,
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

    async getProductPrice(productId: string, branchId?: string, priceListId?: string): Promise<ProductPrice> {
        const selectedProductPrice = await this.productPriceRepo.getProductPrice(productId, { branchId, pricelistId: priceListId });
        return selectedProductPrice;

    }

    async getBatchProductPrices(keys: { productId: string, branchId?: string, priceListId?: string }[]): Promise<ProductPrice[]> {
        const productIds = keys.map(key => key.productId);
        const branchIds = keys.map(key => key.branchId).filter(id => id !== undefined);
        const priceListIds = keys.map(key => key.priceListId).filter(id => id !== undefined);
        console.log("productIds", productIds, "branchIds", branchIds, "priceListIds", priceListIds)
        return await this.productPriceRepo.getProductsPrices(productIds, { branchId: branchIds?.at(0), pricelistId: priceListIds?.at(0) });
    }

    async getBatchProducts(keys: Array<{ productIds: string[] }>): Promise<Product[]> {
        const productIds = keys.map(key => key.productIds).flat();
        return await this.productRepository.getProductsById(productIds);
    }

    // async addSelectedPricesToProducts(products: Product[], { branchId, priceListId }: { branchId?: string, priceListId?: string } | null): Promise<Product[]> {
    //     for await (const product of products) {
    //         const selectedProductPrice = await this.getProductPrice(product.id, branchId, priceListId);
    //         product.prices = [selectedProductPrice];
    //     }
    //     return products;
    // }

    async getProductDetailsWithInventory(productId: string, locationId?: string, branchInfo?: Branch, priceListId?: string): Promise<ProductResponse> {
        const productInfo = await this.productRepository.getProductById(productId);
        if (!productInfo) {
            throw new RequestValidationException({ message: CommonProductErrorMessages.PRODUCT_NOT_FOUND, statusCode: 400 });
        }

        let response = new ProductResponseBuilder().withProduct(productInfo)
        // if (productInfo.hasVariant()) {
        //     const productVariants = await this.productRepository.getProductsById(productInfo.variantsId);
        //     response.withProductVariants(productVariants, branchInfo);
        // }
        await this.productRepository.updateProductStats(productId, { totalViews: productInfo.totalViews + 1 });
        return response.build()
    }

    async getProductInventory(productId: string, locationId?: string): Promise<Inventory[]> {
        return await this.inventoryRepo.getProductInventories(productId, locationId);
    }

    async adddMembershipIdToProducts(productId: string[], membershipId: string): Promise<ProductResponse> {
        const result = await this.productRepository.addMembershipIdToProducts(productId, membershipId);
        return new ProductResponseBuilder().basicResponse(result);
    }

    async removeMembershipIdFromProducts(productId: string[], membershipId: string): Promise<ProductResponse> {
        const result = await this.productRepository.removeMembershipIdFromProducts(productId, membershipId);
        return new ProductResponseBuilder().basicResponse(result);
    }

    async getMembershipProducts(membershipId: string): Promise<ProductResponse> {
        const result = await this.productRepository.getMembershipProducts(membershipId);
        return new ProductResponseBuilder().withProducts(result).build();
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



    async getBranchProducts(branchId: string, query?: QueryHelper<Product>): Promise<Product[]> {
        return await this.productRepository.getBranchProducts(branchId, query);
    }

    async getProductsById(productIds: string[]): Promise<Product[]> {
        return await this.productRepository.getProductsById(productIds);
    }

    async getBusinessProducts(businessId: string, query: QueryHelper<Product>, branchId?: string): Promise<Product[]> {
        let products = [];
        if (branchId != null) {
            products = await this.productRepository.getBranchProducts(branchId, query);
        } else {
            products = await this.productRepository.getBusinessProducts(businessId, query);
        }
        return products;
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

    async createProductPricing(productId: string, priceInput: CreateProductPriceInput[]): Promise<ProductResponse> {
        await this.inputValidator.validateArrayInput(priceInput, CreateProductPriceInput);
        const productPriceInfo = priceInput.map(price => ProductPrice.fromProductPriceInput(productId, price));
        const productPrice = await this.productPriceRepo.createProductPrice(productPriceInfo);
        return new ProductResponseBuilder().withProductPrices(productPrice).build();
    }

    async updateProductPricing(productId: string, priceInput: UpdateProductPriceInput[]): Promise<ProductResponse> {
        await this.inputValidator.validateArrayInput(priceInput, UpdateProductPriceInput);
        const productPriceInfo = priceInput.map(price => ProductPrice.fromProductPriceInput(productId, price));
        const productPrice = await this.productPriceRepo.updateProductPrice(productPriceInfo);
        return new ProductResponseBuilder().withProductPrices(productPrice).build();
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