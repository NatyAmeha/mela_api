import { Inject } from "@nestjs/common";
import { IMembershipRepository, MembershipRepository } from "../repo/membership.repo";
import { CreateMembershipInput, UpdateMembershipInput } from "../dto/membership.input";
import { Membership } from "../model/memberhip.model";
import { Group, GroupMember, GroupMemberStatus } from "../model/group.model";
import { MembershipResponse, MembershipResponseBuilder } from "../dto/membership.response";
import { MembershipResourceTracker } from "../membership_resource_usage_tracker";
import { Subscription } from "../../model/subscription.model";
import { PlatformService } from "../../model/platform_service.model";
import { CommonSubscriptionErrorMessages } from "apps/core/src/utils/const/error_constants";
import { SubscriptionMessageBrocker } from "../../msg_brocker_client/subscription_message_brocker";
import { MembershipSubscriptionOption } from "../../utils/subscrption_factory";
import { SubscriptionRepository } from "../../repo/subscription.repository";
import { User } from "apps/auth/src/auth/model/user.model";
import { PaymentMethodInput } from "../../dto/payment_method_input";
import { PaymentMethod } from "../../model/payment_method";

export class MembershipService {

    constructor(
        @Inject(MembershipRepository.injectName) private membershipRepo: IMembershipRepository,
        @Inject(SubscriptionRepository.InjectName) private subscriptionRepo: SubscriptionRepository,
        @Inject(SubscriptionMessageBrocker.InjectName) private subscriptionBroker: SubscriptionMessageBrocker,
        private membershipResourceTracker: MembershipResourceTracker,
        private membershipSubscriptionOption: MembershipSubscriptionOption,
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

    async getUserMemberships(userId: string): Promise<MembershipResponse> {
        const memberships = await this.membershipRepo.getUserMemberships(userId)
        const result = new MembershipResponseBuilder().withMemberships(memberships)
        return result.build()
    }

    async getMembershipInfo(membershipId: string, user?: User): Promise<MembershipResponseBuilder> {
        const result = await this.membershipRepo.getMembershipPlan(membershipId)
        var response = new MembershipResponseBuilder().withMembership(result).withProducts([]);
        if (user) {
            const userActiveSubscription = await this.subscriptionRepo.getUserActiveMembershipSubscription(user.id, membershipId)
            console.log("userActiveSubscription", userActiveSubscription)
            response.withCurrentUserSubscription(userActiveSubscription);
        }
        return response;
    }

    async getBatchMemberships(keys: { membershipIds: string[] }[], user?: User) {
        const membershipIds = keys.map(key => key.membershipIds).flat();
        const memberships = await this.membershipRepo.getMembershipPlans(membershipIds);
        return memberships;
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

    async getBusinessMembershipPlans(businessId: string, user?: User): Promise<MembershipResponse> {
        const membershipPlans = await this.membershipRepo.getBusinessMembershipPlans(businessId)
        const response = new MembershipResponseBuilder().withMemberships(membershipPlans);
        return response.build();;
    }

    async getUserActiveMembershipSubscription(userId: string, membershipId: string): Promise<Subscription> {
        const userActiveSubscription = await this.subscriptionRepo.getUserActiveMembershipSubscription(userId, membershipId)
        return userActiveSubscription;
    }

    async joinToMembershipGroups(userId: string, membershipId: string, options: { paymentMethod: PaymentMethodInput, onlyDefaultGroups: boolean, groupMemberStatus: GroupMemberStatus, selectedGroupIds?: string[] }) {
        let groupsResult: Group[] = []
        if (options.onlyDefaultGroups) {
            groupsResult = await this.membershipRepo.getDefaultGroupsForMembership(membershipId)
            if (groupsResult?.length === 0) {
                const membershipInfo = await this.membershipRepo.getMembershipPlan(membershipId)
                const defaultGroup = Group.getDefaultGroupForMembership(membershipInfo)
                const createDefaultGroupsResult = await this.membershipRepo.createGroup(defaultGroup)
                groupsResult.push(createDefaultGroupsResult)
            }
        }
        else {
            if (options.selectedGroupIds?.length > 0) {
                groupsResult = await this.membershipRepo.getMembershipSelectedGroups(membershipId, options.selectedGroupIds)
            }
            groupsResult = await this.membershipRepo.getMembershipGroups(membershipId)
        }
        if (groupsResult.length === 0) {
            return new MembershipResponseBuilder().basicResponse(false, "No groups found for this membership")
        }
        const paymentMethod = PaymentMethod.from(options.paymentMethod)
        const membersInfo = GroupMember.getGroupMembers([userId], options.groupMemberStatus, null, paymentMethod)
        const groupJoinResult = await this.membershipRepo.joinGroups(Group.getGroupIds(groupsResult), membersInfo)
        return new MembershipResponseBuilder().basicResponse(groupJoinResult)
    }

    async approveUserMembershipRequest(membershipId: string, userIds: string[]) {
        const membershipInfo = await this.membershipRepo.getMembershipPlan(membershipId)
        const groups = await this.membershipRepo.getMembershipGroups(membershipId)
        if (membershipInfo === null) {
            return new MembershipResponseBuilder().basicResponse(false, "Membership not found")
        }
        if (groups.length === 0) {
            return new MembershipResponseBuilder().basicResponse(false, "No groups found for this membership")
        }
        const subscriptionResponse = await this.membershipSubscriptionOption.createSubscriptionInfoBeta(membershipInfo, userIds[0]) // TODO: change array to single user

        const approveResult = await this.membershipRepo.approveUserMembershipRequest(membershipId, userIds, subscriptionResponse.subscription);
        return new MembershipResponseBuilder().basicResponse(approveResult)
    }

    async getMembershipMembers(membershipId: string): Promise<GroupMember[]> {
        const allMembers = await this.membershipRepo.getAllMembershipMembers(membershipId)
        return allMembers;
    }


}