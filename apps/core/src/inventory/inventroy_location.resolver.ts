import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { InventoryService } from "./inventory.service";
import { InventoryResponse, InventoryResponseBuilder } from "./model/inventory.response";
import { InventoryLocation } from "./model/inventory_location.model";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { UseGuards } from "@nestjs/common";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { CoreServiceMsgBrockerClient } from "../msg_brocker_client/core_service_msg_brocker";
import { CreateInventoryLocationInput, UpdateInventoryLocationInput } from "./dto/inventory_location.input";

@Resolver(of => InventoryLocation)
export class InventoryLocationResolver {
    constructor(
        private inventoryService: InventoryService,
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient
    ) { }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.INVENTORY_LOCATION, action: PERMISSIONACTION.CREATE, resourcTargetName: "branchId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ]
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => InventoryResponse, { description: "Returns the created inventory location in location field of inventoryResponse object" })
    async createInventoryLocationForBranch(@Args("businessId") businessId: string, @Args("branchId") branchId: string, @Args("locationData") locationData: CreateInventoryLocationInput): Promise<InventoryResponse> {
        const result = await this.inventoryService.createInventoryLocation(businessId, branchId, locationData)
        return result;
    }



    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.INVENTORY_LOCATION, action: PERMISSIONACTION.UPDATE },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY }
        ]
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => InventoryResponse)
    async updateInventoryLocation(@Args("locationId") locationId: string, @Args('inventoryLocationInfo') inventoryLocationInfo: UpdateInventoryLocationInput): Promise<InventoryResponse> {
        let inventoryLocation = inventoryLocationInfo.getInventoryLocation();
        let result = await this.inventoryService.updateInventoryLocation(locationId, inventoryLocation);
        return result;
    }

}