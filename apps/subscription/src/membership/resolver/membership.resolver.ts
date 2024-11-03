import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Membership } from "../model/memberhip.model";
import { MembershipService } from "./membership.service";
import { create } from "lodash";
import { MembershipResponse } from "../dto/membership.response";
import { CreateMembershipInput, UpdateMembershipInput } from "../dto/membership.input";
import { Inject, UseGuards } from "@nestjs/common";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { SubscriptionService } from "../../usecase/subscription.usecase";
import { PlatformService } from "../../model/platform_service.model";
import { PlatfromUsecase } from "../../usecase/platform.usecase";
import { ResourceTargetIdentifier } from "@app/common/utils/resource_target_constants";
import { CurrentUser } from "libs/common/get_user_decorator";
import { User } from "apps/auth/src/auth/model/user.model";
import { Group, GroupMember, GroupMemberStatus } from "../model/group.model";
import { AuthzGuard } from "libs/common/authorization.guard";
import { ISubscriptionOption, MembershipSubscriptionOption } from "../../utils/subscrption_factory";
import { PaymentMethodInput } from "../../dto/payment_method_input";
import { Subscription } from "../../model/subscription.model";
import { MembershipLoader } from "./membership_loader";

@Resolver(of => Membership)
export class MembershipResolver {
    constructor(
        private membershipService: MembershipService,
        private subscriptionService: SubscriptionService,

        private platformService: PlatfromUsecase) {

    }


    // @UseGuards(AuthzGuard)
    @Query(returns => MembershipResponse)
    async getMembershipDetails(@Args(ResourceTargetIdentifier.MEMBERSHIPID) membershipId: string, @CurrentUser() user?: User): Promise<MembershipResponse> {
        const response = await this.membershipService.getMembershipInfo(membershipId, user);
        return response.build();
    }

    @UseGuards(AuthzGuard)
    @Query(returns => MembershipResponse)
    async getUserMemberships(@CurrentUser() user: User): Promise<MembershipResponse> {
        const response = await this.membershipService.getUserMemberships(user.id);
        return response;
    }

    @Query(returns => MembershipResponse)
    async getBusinessMembershipPlans(@Args(ResourceTargetIdentifier.BUSINESSID) businessId: string, @CurrentUser() user?: User): Promise<MembershipResponse> {
        const response = await this.membershipService.getBusinessMembershipPlans(businessId, user);
        return response;
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.MEMBERSHIP, action: PERMISSIONACTION.CREATE, resourcTargetName: ResourceTargetIdentifier.BUSINESSID },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: ResourceTargetIdentifier.BUSINESSID }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => MembershipResponse)
    async createMembershipPlan(@Args(ResourceTargetIdentifier.BUSINESSID) businessId: string, @Args("input") input: CreateMembershipInput): Promise<MembershipResponse> {
        const businessSubscriptionResponse = await this.subscriptionService.getBusinessSubscription(businessId);
        const platformServices = await this.platformService.getPlatAllPlatformServices({});
        const result = await this.membershipService.createMembershipPlan({ businessId: businessId, input: input, businessSubscription: businessSubscriptionResponse.subscription, platformServices: platformServices });
        return result;
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.MEMBERSHIP, action: PERMISSIONACTION.UPDATE, resourcTargetName: ResourceTargetIdentifier.MEMBERSHIPID },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: ResourceTargetIdentifier.BUSINESSID }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => MembershipResponse)
    async updateMembershipInfo(@Args(ResourceTargetIdentifier.BUSINESSID) businessId: string, @Args(ResourceTargetIdentifier.MEMBERSHIPID) membershipId: string, @Args("input") input: UpdateMembershipInput): Promise<MembershipResponse> {
        const result = await this.membershipService.updateMembershipPlan(membershipId, input);
        return result;
    }


    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.MEMBERSHIP, action: PERMISSIONACTION.UPDATE, resourcTargetName: ResourceTargetIdentifier.MEMBERSHIPID },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: ResourceTargetIdentifier.BUSINESSID }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => MembershipResponse)
    async assignProductsToMembershipPlan(@Args(ResourceTargetIdentifier.BUSINESSID) businessId: string, @Args(ResourceTargetIdentifier.MEMBERSHIPID) membershipId: string, @Args({ name: "productIds", type: () => [String] }) productIds: string[]): Promise<MembershipResponse> {
        const result = await this.membershipService.assignProductsToMembershipPlan(membershipId, productIds);
        return result;
    }


    @UseGuards(AuthzGuard)
    @Mutation(returns => MembershipResponse)
    async joinMemership(@Args("membershipId") membershipId: string, @CurrentUser() user: User, @Args("paymentMethod") paymentMethod: PaymentMethodInput) {
        // join membership
        const result = await this.membershipService.joinToMembershipGroups(user.id, membershipId, { paymentMethod: paymentMethod, onlyDefaultGroups: true, groupMemberStatus: GroupMemberStatus.PENDING });
        return result;
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.MEMBERSHIP, action: PERMISSIONACTION.UPDATE, resourcTargetName: ResourceTargetIdentifier.MEMBERSHIPID },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: ResourceTargetIdentifier.BUSINESSID }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => MembershipResponse)
    async approveMembershipRequest(@Args(ResourceTargetIdentifier.BUSINESSID) businessId: string, @Args(ResourceTargetIdentifier.MEMBERSHIPID) membershipId: string, @Args({ name: "membersId", type: () => [String] },) membersId: string[]) {
        const result = await this.membershipService.approveUserMembershipRequest(membershipId, membersId);
        return result;
    }


    @ResolveField('allMembers', returns => [GroupMember])
    async getMembershipMembers(@Parent() membership: Membership): Promise<GroupMember[]> {
        const result = await this.membershipService.getMembershipMembers(membership.id);
        return result;
    }

    @ResolveField('activeSubscription', returns => Subscription)
    async getActiveSubscription(@Parent() membershipGroupMember: GroupMember): Promise<Subscription> {
        console.log('resolve subscription  filed', membershipGroupMember)
        const result = await this.subscriptionService.getActiveSubscription(membershipGroupMember.activeSubscriptionId);
        console.log('resolve subscription  filed', result)
        return result;
    }

    @ResolveField('currentUserSubscription', returns => Subscription, { nullable: true })
    async getCurrentUserSubscription(@Parent() membership: Membership, @CurrentUser() user?: User): Promise<Subscription | null> {
        console.log('resolve current user subscription', membership, user)
        if (!user) {
            return null;
        }
        const result = await this.membershipService.getUserActiveMembershipSubscription(user.id, membership.id);
        return result;
    }


}