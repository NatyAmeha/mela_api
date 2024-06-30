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

@Resolver(of => Membership)
export class MembershipResolver {
    constructor(private membershipService: MembershipService) {

    }

    @RequiresPermission({
        permissions: [
            // { resourceType: AppResources.PRODUCT, action: PERMISSIONACTION.CREATE, resourcTargetName: "branchIds" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => MembershipResponse)
    async createMembershipPlan(@Args("businessId") businessId: string, @Args("input") input: CreateMembershipInput): Promise<MembershipResponse> {
        const result = await this.membershipService.createMembershipPlan(businessId, input);
        return result;
    }
}