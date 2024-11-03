import { Inject, Injectable } from "@nestjs/common";
import { IInventoryRepository, InventoryRepository } from "./repo/inventory.repository";
import { InventoryLocationRepository } from "./repo/inventory_location.repository";
import { InventoryLocation } from "./model/inventory_location.model";
import { InventoryResponse, InventoryResponseBuilder } from "./model/inventory.response";
import { CreateInventoryLocationInput } from "./dto/inventory_location.input";
import { SubscriptionResponse } from "apps/subscription/src/model/response/subscription.response";
import { BranchResourceUsageTracker, IBranchResourceUsageTracker } from "../resource_usage_tracker/branch_resource_usage_tracker";
import { CreateInventoryInput, UpdateInventoryInput } from "../product/dto/inventory.input";
import { Inventory } from "./model/inventory.model";
import { ProductRepository } from "../product/repo/product.repository";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

@Injectable()
export class InventoryService {

    constructor(
        @Inject(InventoryRepository.injectName) private inventoryRepository: IInventoryRepository,
        @Inject(InventoryLocationRepository.injectName) private inventoryLocationRepository: InventoryLocationRepository,
        @Inject(ProductRepository.injectName) private productRepository: ProductRepository,
    ) {
    }

    async addInventoryToProduct(businessId: string, productId: string, inventory: CreateInventoryInput): Promise<InventoryResponse> {
        const productResult = await this.productRepository.getProductById(productId);
        if (!productResult) {
            throw new RequestValidationException({ message: "Product not found", statusCode: 400 });
        }
        if (!productResult.isProductPartOfBusiness(businessId)) {
            throw new RequestValidationException({ message: "Product is not part of business" });
        }
        var fullInventoryInfo = await Inventory.fromCreateInventory(productResult.name[0].value, productResult.sku, inventory);
        const inventoryCreateResult = await this.inventoryRepository.addInventoriesOnProduct(productId, fullInventoryInfo);
        return new InventoryResponseBuilder().withInventory(inventoryCreateResult).build();
    }

    async updateInventories(inventories: UpdateInventoryInput[]): Promise<InventoryResponse> {
        const inventoryUpdateResult = await this.inventoryRepository.updateInventoriesInformation(inventories);
        return new InventoryResponseBuilder().withInventories(inventoryUpdateResult).build();
    }

    async updateInventoryLocation(inventoryLocationId: string, inventoryLocationInfo: InventoryLocation): Promise<InventoryResponse> {
        const result = await this.inventoryLocationRepository.updateInventoryLocationInfo(inventoryLocationId, inventoryLocationInfo);
        return new InventoryResponseBuilder().withInvetoryLocation(result).build();
    }


    async createInventoryLocation(businessId: string, branchId: string, locationInfo: CreateInventoryLocationInput): Promise<InventoryResponse> {
        const inventoryLocationInfo = InventoryLocation.getInventoryLocationInfo(businessId, branchId, locationInfo)
        const inventoryLocationResult = await this.inventoryLocationRepository.createInventoryLocation(inventoryLocationInfo)
        return new InventoryResponseBuilder().withInvetoryLocation(inventoryLocationResult).build()
    }

    async getBatchProductInventories(keys: { productId: string; locationId?: string; }[]) {
        const productIds = keys.map(key => key.productId);
        const locationIds = keys.map(key => key.locationId).filter(id => id !== undefined);
        return await this.inventoryRepository.getBatchProductInventories(productIds, locationIds);
    }
}