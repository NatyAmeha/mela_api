import { Inject } from "@nestjs/common";
import { IMembershipRepository, MembershipRepository } from "../repo/membership.repo";
import { CreateMembershipInput, UpdateMembershipInput } from "../dto/membership.input";
import { Membership } from "../model/memberhip.model";
import { Group } from "../model/group.model";
import { MembershipResponse, MembershipResponseBuilder } from "../dto/membership.response";
import { MembershipResourceTracker } from "../membership_resource_usage_tracker";
import { Subscription } from "../../model/subscription.model";
import { PlatformService } from "../../model/platform_service.model";
import { CommonSubscriptionErrorMessages } from "apps/core/src/utils/const/error_constants";

export class MembershipService {
    constructor(
        @Inject(MembershipRepository.injectName) private membershipRepo: IMembershipRepository,
        private membershipResourceTracker: MembershipResourceTracker
    ) {

    }

    async createMembershipPlan({ businessId, input, businessSubscription, platformServices }: { businessId: string, input: CreateMembershipInput, businessSubscription: Subscription, platformServices: PlatformService[] }): Promise<MembershipResponse> {
        const membershipInfo = Membership.fromCreateMembershipPlanInput(input, businessId)
        const resourceUsage = await this.membershipResourceTracker.getBusinessMembershipResourceUsage(businessId, businessSubscription, platformServices)
        console.log("resourceUsage", resourceUsage)
        if (resourceUsage.isExceededMaxUsage(1)) {
            return new MembershipResponseBuilder().basicResponse(false, resourceUsage.message ?? CommonSubscriptionErrorMessages.UPGRADE_SUBSCRIPTION_TO_USE_THIS_SERVICE)
        }
        const defaultGroup = Group.getDefaultGroupForMembership(membershipInfo)
        const result = await this.membershipRepo.createMembershipPlan(membershipInfo, [defaultGroup])
        return new MembershipResponseBuilder().withMembership(result).build();
    }

    async updateMembershipPlan(planId: string, input: UpdateMembershipInput) {
        const membershipInfo = Membership.fromCreateMembershipPlanInput(input)
        const result = await this.membershipRepo.updateMembershipPlan(planId, membershipInfo)
        return new MembershipResponseBuilder().basicResponse(result)
    }

    async getMembershipInfo(membershipId: string) {
        const result = await this.membershipRepo.getMembershipPlan(membershipId)
        // const produc = result.
        return new MembershipResponseBuilder().withMembership(result).build();
    }


}