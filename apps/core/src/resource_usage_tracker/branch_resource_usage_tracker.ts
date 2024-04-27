import { Subscription } from "apps/subscription/src/model/subscription.model";
import { BaseResourceUsageTracker } from "./base_resource_usage_tracker";
import { ResourceUsage, ResourceUsageBuilder } from "./resource_usage";
import { AppResources, BranchResourceAction } from "apps/mela_api/src/const/app_resource.constant";
import { PlatformService, PlatformServiceType } from "apps/subscription/src/model/platform_service.model";
import { BranchRepository } from "../branch/repo/branch.repository";
import { Inject } from "@nestjs/common";

export interface IBranchResourceUsageTracker extends BaseResourceUsageTracker {
    getBusinessBranchCreationUsage(businessId: string, businessSubscription: Subscription, platformServices: PlatformService[]): Promise<ResourceUsage>

}

export class BranchResourceUsageTracker extends BaseResourceUsageTracker implements IBranchResourceUsageTracker {
    static injectName = "BranchResourceUsageTracker"
    constructor(@Inject(BranchRepository.injectName) private branchRepo: BranchRepository) {
        super()
    }
    async getBusinessBranchCreationUsage(businessId: string, businessSubscriptionObj: Subscription, platformServices: PlatformService[]): Promise<ResourceUsage> {
        var allowedBranchCreationActions = Object.values(BranchResourceAction);
        let subscriptionInstance = this.convertSubscriptionObjToInstance(businessSubscriptionObj)
        let isSubscriptionValid = await this.isPlatformServiceSubscriptionValid(subscriptionInstance, PlatformServiceType.POINT_OF_SALE, platformServices);
        if (!isSubscriptionValid) {
            let result = new ResourceUsageBuilder(businessId, AppResources.BRANCH).createInvalidResourceUsage("Subscription expired for this service. Please renew your subscription to create additional branch");
            return result;
        }
        let allowedPlatformServiceCustomizationUsage = await this.getAllowedPlatformServiceCusomizationFromSubscription(subscriptionInstance, platformServices, allowedBranchCreationActions);
        if (!allowedPlatformServiceCustomizationUsage) {
            let result = new ResourceUsageBuilder(businessId, AppResources.BRANCH).createInvalidResourceUsage("Unable to create new branch. Upgrade your subscription to add more branches");
            return result;
        }

        let businessBranches = await this.branchRepo.getBusinessBranches(businessId);
        let usage = businessBranches.length;
        let maxAllowedUsage = parseInt(allowedPlatformServiceCustomizationUsage.value);
        return new ResourceUsageBuilder(businessId, AppResources.BRANCH).createSuccessResourceUsage(usage, maxAllowedUsage);
    }
}