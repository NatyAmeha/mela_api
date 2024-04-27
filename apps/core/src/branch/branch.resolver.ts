import { Injectable, UseGuards } from "@nestjs/common";
import { BranchService } from "./usecase/branch.service";
import { Branch } from "./model/branch.model";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BusinessResponse, BusinessResponseBuilder } from "../business/model/business.response";
import { Business } from "../business/model/business.model";
import { CreateBranchInput, UpdateBranchInput } from "./dto/branch.input";
import { BusinessService } from "../business/usecase/business.service";
import { BranchResponse } from "./model/branch.response";
import { ProductService } from "../product/product.service";
import { CoreServiceMsgBrockerClient } from "../msg_brocker_client/core_service_msg_brocker";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";

@Resolver(of => Branch)
export class BranchResolver {
    constructor(
        private branchService: BranchService,
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient,
        private productService: ProductService,
        private businessService: BusinessService,
    ) {
        this.branchService = branchService;
    }

    @Query(returns => BranchResponse)
    async getBranchDetails(@Args('branchId') branchId: string): Promise<BranchResponse> {
        let branch = await this.branchService.getBranch(branchId);
        let branchProducts = await this.productService.getBranchProducts(branchId);
        return {
            success: true,
            branch: branch,
            products: branchProducts
        }
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BRANCH, action: PERMISSIONACTION.CREATE },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async createBranch(@Args("businessId") businessId: string, @Args('branchInfo') branchInfo: CreateBranchInput): Promise<BusinessResponse> {
        let businessSubscriptionResponse = await this.coreServiceMsgBrocker.getBusinessSubscription(businessId);
        if (!businessSubscriptionResponse || !businessSubscriptionResponse.success) {
            return new BusinessResponseBuilder().withError(businessSubscriptionResponse.message);
        }
        let subscriptionInfo = businessSubscriptionResponse.data;
        let branchCreateResult = await this.branchService.addBranchToBusiness(businessId, branchInfo, subscriptionInfo.subscription, subscriptionInfo.platformServices);
        return branchCreateResult;
    }

    @Mutation(returns => BusinessResponse)
    async updateBranchInfo(@Args('branchId') branchId: string, @Args('branchInfo') branchInfo: UpdateBranchInput): Promise<BusinessResponse> {
        let branchResult = await this.branchService.updateBranchInfo(branchId, branchInfo.toBranchInfo());
        let response = new BusinessResponseBuilder().withBranchUpdated(branchResult).build();
        return response;
    }




    // ------------------ Nested Queries ------------------

    // responsd for nested query for business field inside branch type
    @ResolveField('business', returns => Business)
    async getBranchBusinesss(@Parent() branchInfo: Branch): Promise<Business> {
        let businessResponse = await this.businessService.getBranchBusiness(branchInfo.id);
        return businessResponse.business
    }

}