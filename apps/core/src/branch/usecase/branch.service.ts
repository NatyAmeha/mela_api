import { Inject, Injectable } from "@nestjs/common";
import { BranchRepository, IBranchRepository } from "../repo/branch.repository";
import { Branch } from "../model/branch.model";
import { CreateBranchInput } from "../dto/branch.input";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformService } from "apps/subscription/src/model/platform_service.model";
import { BranchResourceUsageTracker, IBranchResourceUsageTracker } from "../../resource_usage_tracker/branch_resource_usage_tracker";
import { IResourceUsageTracker } from "../../resource_usage_tracker/base_resource_usage_tracker";
import { BusinessResponse, BusinessResponseBuilder } from "../../business/model/business.response";

@Injectable()
export class BranchService {
    constructor(
        @Inject(BranchRepository.injectName) private branchRepo: IBranchRepository,
        @Inject(BranchResourceUsageTracker.injectName) private branchResourceUsageTracker: IBranchResourceUsageTracker
    ) {
    }

    async addBranchToBusiness(businessId: string, branchInfo: CreateBranchInput, subscriptionInput: Subscription, platformServices: PlatformService[]): Promise<BusinessResponse> {
        var fullBranchInfo = branchInfo.toBranch(businessId);
        let branchResourceUsage = await this.branchResourceUsageTracker.getBusinessBranchCreationUsage(businessId, subscriptionInput, platformServices);
        console.log("Branch resource usage", branchResourceUsage)
        if (branchResourceUsage.isAtMaxUsage()) {
            return new BusinessResponseBuilder().withError("You have reached the maximum number of branches you can create.");
        }
        let createdBranchResult = await this.branchRepo.addBranchToBusiness(businessId, fullBranchInfo);
        return new BusinessResponseBuilder().withBranchAdded(createdBranchResult).build();
    }

    updateBranchInfo(branchId: string, branchInfo: Partial<Branch>) {
        return this.branchRepo.updateBranch(branchId, branchInfo);
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