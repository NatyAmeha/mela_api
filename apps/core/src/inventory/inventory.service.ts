import { Inject, Injectable } from "@nestjs/common";
import { IInventoryRepository, InventoryRepository } from "./repo/inventory.repository";
import { InventoryLocationRepository } from "./repo/inventory_location.repository";
import { InventoryLocation } from "./model/inventory_location.model";
import { InventoryResponse, InventoryResponseBuilder } from "./model/inventory.response";
import { CreateInventoryLocationInput } from "./dto/inventory_location.input";
import { SubscriptionResponse } from "apps/subscription/src/model/response/subscription.response";
import { BranchResourceUsageTracker, IBranchResourceUsageTracker } from "../resource_usage_tracker/branch_resource_usage_tracker";
import { UpdateInventoryInput } from "../product/dto/inventory.input";

@Injectable()
export class InventoryService {
    constructor(
        @Inject(InventoryRepository.injectName) private inventoryRepository: IInventoryRepository,
        @Inject(InventoryLocationRepository.injectName) private inventoryLocationRepository: InventoryLocationRepository,
        @Inject(BranchResourceUsageTracker.injectName) private branchResourceUsageTracker: IBranchResourceUsageTracker
    ) {
    }

    async updateInventories(inventories: UpdateInventoryInput[]): Promise<InventoryResponse> {
        const inventoryUpdateResult = await this.inventoryRepository.updateInventoriesInformation(inventories);
        return new InventoryResponseBuilder().withInventories(inventoryUpdateResult).build();
    }

    async updateInventoryLocation(inventoryLocationId: string, inventoryLocationInfo: InventoryLocation): Promise<InventoryResponse> {
        const result = await this.inventoryLocationRepository.updateInventoryLocationInfo(inventoryLocationId, inventoryLocationInfo);
        return new InventoryResponseBuilder().withInvetoryLocation(result).build();
    }


}