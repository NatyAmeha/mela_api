import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Membership } from "../model/memberhip.model";
import { MembershipService } from "./membership.service";
import { create } from "lodash";
import { MembershipResponse } from "../dto/membership.response";
import { CreateMembershipInput } from "../dto/membership.input";
import { UseGuards } from "@nestjs/common";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { SubscriptionService } from "../../usecase/subscription.usecase";
import { PlatformService } from "../../model/platform_service.model";
import { PlatfromUsecase } from "../../usecase/platform.usecase";

@Resolver(of => Membership)
export class MembershipResolver {
    constructor(private membershipService: MembershipService, private subscriptionService: SubscriptionService, private platformService: PlatfromUsecase) {

    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.MEMBERSHIP, action: PERMISSIONACTION.CREATE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => MembershipResponse)
    async createMembershipPlan(@Args("businessId") businessId: string, @Args("input") input: CreateMembershipInput): Promise<MembershipResponse> {
        const businessSubscriptionResponse = await this.subscriptionService.getBusinessSubscription(businessId);
        const platformServices = await this.platformService.getPlatAllPlatformServices({});
        const result = await this.membershipService.createMembershipPlan({ businessId: businessId, input: input, businessSubscription: businessSubscriptionResponse.subscription, platformServices: platformServices });
        return result;
    }

    @RequiresPermission({
        permissions: [
            // { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.CREATE, resourcTargetName: "branchIds" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => MembershipResponse)
    async updateMembershipInfo(@Args("businessId") businessId: string, @Args("membershipId") membershipId: string, @Args("input") input: CreateMembershipInput): Promise<MembershipResponse> {
        const result = await this.membershipService.updateMembershipPlan(membershipId, input);
        return result;
    }


    async getMembershipDetails(@Args("membershipId") membershipId: string): Promise<MembershipResponse> {
        const result = await this.membershipService.getMembershipInfo(membershipId);
        return result;
    }
}