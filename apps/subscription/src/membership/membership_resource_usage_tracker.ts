import { AppResources, MEMBERSHIPRESOURCEACTION } from "apps/mela_api/src/const/app_resource.constant";
import { ResourceUsage, ResourceUsageBuilder } from "../../../core/src/resource_usage_tracker/resource_usage";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformService, PlatformServiceType } from "apps/subscription/src/model/platform_service.model";
import { IMembershipRepository, MembershipRepository } from "apps/subscription/src/membership/repo/membership.repo";
import { Inject, Injectable } from "@nestjs/common";
import { BaseResourceUsageTrackerBeta } from "../base_resource_usage_tracker_beta";
import { CommonSubscriptionErrorMessages } from "apps/core/src/utils/const/error_constants";

@Injectable()
export class MembershipResourceTracker extends BaseResourceUsageTrackerBeta {
    static injectName = "MembershipResourceTracker"

    constructor(@Inject(MembershipRepository.injectName) private membershipRepo: IMembershipRepository) {
        super()
    }

    async getBusinessMembershipResourceUsage(businessId: string, businessSubscription: Subscription, platformServices: PlatformService[]): Promise<ResourceUsage> {
        const allowedMembershipActions = Object.values(MEMBERSHIPRESOURCEACTION);
        let isSubscriptionValid = await this.isPlatformServiceSubscriptionValid(businessSubscription, PlatformServiceType.MEMBERSHIP, platformServices);
        if (!isSubscriptionValid) {
            return new ResourceUsageBuilder(businessId, AppResources.MEMBERSHIP).createInvalidResourceUsage(CommonSubscriptionErrorMessages.SUBSCRIPTION_EXPIRED_FOR_THIS_SERVICE);
        }
        let allowedPlatformServiceCustomizationUsage = await this.getAllowedPlatformServiceCusomizationFromSubscription(businessSubscription, platformServices, allowedMembershipActions);
        if (!allowedPlatformServiceCustomizationUsage) {
            return new ResourceUsageBuilder(businessId, AppResources.MEMBERSHIP).createInvalidResourceUsage(CommonSubscriptionErrorMessages.UPGRADE_SUBSCRIPTION_TO_USE_THIS_SERVICE);
        }

        let businessMemberships = await this.membershipRepo.getBusinessMembershipPlans(businessId);
        let usage = businessMemberships.length;
        let maxAllowedUsage = parseInt(allowedPlatformServiceCustomizationUsage.value);
        return new ResourceUsageBuilder(businessId, AppResources.MEMBERSHIP).createSuccessResourceUsage(usage, maxAllowedUsage);
    }

    async getMembershipMembersResourceUsage(membershipId: string, businessSubscription: Subscription, platformServices: PlatformService[]): Promise<ResourceUsage> {
        const allowedMembershipActions = Object.values(MEMBERSHIPRESOURCEACTION);
        let isSubscriptionValid = await this.isPlatformServiceSubscriptionValid(businessSubscription, PlatformServiceType.MEMBERSHIP, platformServices);
        if (!isSubscriptionValid) {
            return new ResourceUsageBuilder(membershipId, AppResources.MEMBERSHIP).createInvalidResourceUsage("Subscription expired for this service. Please renew your subscription to create additional membership");
        }
        let allowedPlatformServiceCustomizationUsage = await this.getAllowedPlatformServiceCusomizationFromSubscription(businessSubscription, platformServices, allowedMembershipActions);
        if (!allowedPlatformServiceCustomizationUsage) {
            return new ResourceUsageBuilder(membershipId, AppResources.MEMBERSHIP).createInvalidResourceUsage("Unable to create new membership. Upgrade your subscription to add more memberships");
        }

        let membershipGroups = await this.membershipRepo.getMembershipGroups(membershipId);
        let usage = membershipGroups.length;
        let maxAllowedUsage = parseInt(allowedPlatformServiceCustomizationUsage.value);
        return new ResourceUsageBuilder(membershipId, AppResources.MEMBERSHIP).createSuccessResourceUsage(usage, maxAllowedUsage);
    }

}