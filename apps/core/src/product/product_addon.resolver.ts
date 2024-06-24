import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { ProductAddon } from "./model/product_addon.model";
import { CreateProductAddonInput, UpdateProductAddonInput } from "./dto/product_addon.input";
import { ProductService } from "./product.service";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { UseGuards } from "@nestjs/common";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { ProductResponse } from "./model/product.response";

@Resolver(of => ProductAddon)
export class ProductAddonResolver {

    constructor(private productService: ProductService) { }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.CREATE, resourcTargetName: "productId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse, { description: "Return a boolean value to indicate if the product addon is created successfully or not" })
    async createProductAddon(@Args("businessId") businessId: string, @Args("productId") productId: string, @Args({ name: "input", type: () => [CreateProductAddonInput] }) input: CreateProductAddonInput[]) {
        var result = await this.productService.createProductAddon(productId, input)
        return result;
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.UPDATE, resourcTargetName: "productId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse, { description: "Add addon id alognside with new addon info to update the product addon. return boolean value to indicate if the product addon is updated successfully" })
    async updateProductAddons(@Args("businessId") businessId: string, @Args("productId") productId: string, @Args({ name: "input", type: () => [UpdateProductAddonInput] }) input: UpdateProductAddonInput[]) {
        var result = await this.productService.updateProductAddon(productId, input)
        return result;
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.UPDATE, resourcTargetName: "productId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => ProductResponse, { description: "Return a boolean value to indicate if the product addon is deleted successfully or not" })
    async deleteProductAddon(@Args("businessId") businessId: string, @Args("productId") productId: string, @Args("addonId") addonId?: string) {
        var result = await this.productService.deleteProductAddon(productId, addonId)
        return result;
    }
}