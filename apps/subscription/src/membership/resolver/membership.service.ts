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
import { SubscriptionMessageBrocker } from "../../msg_brocker_client/subscription_message_brocker";

export class MembershipService {
    constructor(
        @Inject(MembershipRepository.injectName) private membershipRepo: IMembershipRepository,
        @Inject(SubscriptionMessageBrocker.InjectName) private subscriptionBroker: SubscriptionMessageBrocker,
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
        const membershipProducts = await this.subscriptionBroker.getMembershipProductsFromCoreService(membershipId)
        return new MembershipResponseBuilder().withMembership(result).withProducts(membershipProducts).build();
    }


    async assignProductsToMembershipPlan(membershipId: string, productIds: string[]) {
        // update membership data
        const result = await this.membershipRepo.assignProductstoMembershipPlan(membershipId, productIds)
        const messagePublishResult = await this.subscriptionBroker.sendProductAssignedToMembershipEvent(membershipId, productIds)
        if (!messagePublishResult) {
            await this.membershipRepo.unassignProductsFromMembershipPlan(membershipId, productIds)
            return new MembershipResponseBuilder().basicResponse(false, "Error occured while assigning products to membership plan")
        }
        return new MembershipResponseBuilder().basicResponse(result)
    }


}