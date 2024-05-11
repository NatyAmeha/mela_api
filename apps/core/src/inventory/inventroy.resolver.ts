import { Args, Mutation } from "@nestjs/graphql";
import { InventoryService } from "./inventory.service";
import { InventoryResponse, InventoryResponseBuilder } from "./model/inventory.response";
import { InventoryLocation } from "./model/inventory_location.model";
import { CreateInventoryLocationInput } from "./dto/inventory.input";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { UseGuards } from "@nestjs/common";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { CoreServiceMsgBrockerClient } from "../msg_brocker_client/core_service_msg_brocker";

export class InventoryResolver {
    constructor(
        private inventoryService: InventoryService,
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient,) { }




}