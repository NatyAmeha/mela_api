import { Inject, Injectable } from "@nestjs/common";
import { BranchRepository, IBranchRepository } from "../repo/branch.repository";
import { Branch } from "../model/branch.model";
import { CreateBranchInput } from "../dto/branch.input";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformService } from "apps/subscription/src/model/platform_service.model";
import { BranchResourceUsageTracker, IBranchResourceUsageTracker } from "../../resource_usage_tracker/branch_resource_usage_tracker";
import { IResourceUsageTracker } from "../../resource_usage_tracker/base_resource_usage_tracker";
import { BusinessResponse, BusinessResponseBuilder } from "../../business/model/business.response";
import { BranchResponseBuilder } from "../model/branch.response";
import { InventoryLocationRepository } from "../../inventory/repo/inventory_location.repository";
import { InventoryLocationBuilder } from "../../inventory/model/inventory_location.model";

@Injectable()
export class BranchService {
    constructor(
        @Inject(BranchRepository.injectName) private branchRepo: IBranchRepository,
        @Inject(BranchResourceUsageTracker.injectName) private branchResourceUsageTracker: IBranchResourceUsageTracker,
        @Inject(InventoryLocationRepository.injectName) private inventoryLocationRepository: InventoryLocationRepository,
        private businessReponseBuilder: BusinessResponseBuilder,
        private inventoryLocationBuilder: InventoryLocationBuilder
    ) {
    }

    async addBranchToBusiness(businessId: string, branchInfo: CreateBranchInput, subscriptionInput: Subscription, platformServices: PlatformService[]): Promise<BusinessResponse> {
        var fullBranchInfo = branchInfo.toBranch(businessId);
        let branchResourceUsage = await this.branchResourceUsageTracker.getBusinessBranchCreationUsage(businessId, subscriptionInput, platformServices);
        console.log("Branch resource usage", branchResourceUsage)
        if (branchResourceUsage.isAtMaxUsage()) {
            return this.businessReponseBuilder.withError("You have reached the maximum number of branches you can create.");
        }
        const createdBranchResult = await this.branchRepo.addBranchToBusiness(businessId, fullBranchInfo);
        const inventoryLocationInfo = this.inventoryLocationBuilder.fromBranch(createdBranchResult).build();
        await this.inventoryLocationRepository.createInventoryLocation(inventoryLocationInfo);
        return this.businessReponseBuilder.withBranchAdded(createdBranchResult).build();
    }

    updateBranchInfo(branchId: string, branchInfo: Partial<Branch>) {
        return this.branchRepo.updateBranch(branchId, branchInfo);
    }

    async deleteBranch(businessId: string, branchId: string) {
        let deletedBranchInfo = await this.branchRepo.deleteBranch(businessId, branchId);
        if (deletedBranchInfo.id) {
            return new BranchResponseBuilder().basicResponse(true, "Branch deleted successfully")
        }
        return new BranchResponseBuilder().basicResponse(false, "Unable to delete branch. Please try again later.")
    }

    async getBranch(branchId: string): Promise<Branch> {
        return await this.branchRepo.getBranch(branchId);
    }

    async getBusinessBranches(businessId: string): Promise<Branch[]> {
        return await this.branchRepo.getBusinessBranches(businessId);
    }


    async getProductBranchs(productId: string): Promise<Branch[]> {
        return await this.branchRepo.getProductBranchs(productId);
    }

    async getBranchInfoForStaff(staffId: string): Promise<Branch> {
        return await this.branchRepo.getBranchInfoForStaff(staffId);
    }

}