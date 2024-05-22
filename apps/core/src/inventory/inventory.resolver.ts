import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Inventory } from "./model/inventory.model";
import { UpdateInventoryInput } from "../product/dto/inventory.input";
import { UpdateProductInput } from "../product/dto/product.input";
import { InventoryResponse } from "./model/inventory.response";
import { Inject, UseGuards } from "@nestjs/common";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { InventoryService } from "./inventory.service";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";

@Resolver(of => Inventory)
export class InventoryResolver {
    constructor(
        private inventoryService: InventoryService,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator

    ) { }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.INVENTORY, action: PERMISSIONACTION.UPDATE },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE }
        ]
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => InventoryResponse)
    async createNewInventory() { }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.UPDATE, resourcTargetName: "productId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE, resourcTargetName: "businessId" }
        ]
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => InventoryResponse)
    async updateProductInventoryInformations(@Args("businessId") businessId: string, @Args("productId") productId: string, @Args({ name: "inventoryInfos", type: () => [UpdateInventoryInput] }) inventoryInfos: UpdateInventoryInput[]): Promise<InventoryResponse> {
        await this.inputValidator.validateArrayInput(inventoryInfos, UpdateInventoryInput);
        return this.inventoryService.updateInventories(inventoryInfos);
    }

} 