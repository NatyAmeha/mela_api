import { Injectable, UseGuards } from "@nestjs/common";
import { BranchService } from "./usecase/branch.service";
import { Branch } from "./model/branch.model";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BusinessResponse, BusinessResponseBuilder } from "../business/model/business.response";
import { Business } from "../business/model/business.model";
import { CreateBranchInput, UpdateBranchInput } from "./dto/branch.input";
import { BusinessService } from "../business/usecase/business.service";
import { BranchResponse } from "./model/branch.response";
import { ProductService } from "../product/usecase/product.service";
import { CoreServiceMsgBrockerClient } from "../msg_brocker_client/core_service_msg_brocker";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { Product } from "../product/model/product.model";

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
    async getBranchDetails(@Args("businessId") businessId: string, @Args('branchId') branchId: string): Promise<BranchResponse> {
        await this.businessService.getBusinessDetails(businessId);
        const response = await this.branchService.getBranchDetails(businessId, branchId);
        return response;
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BRANCH, action: PERMISSIONACTION.READ, resourcTargetName: "branchId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Query(returns => BranchResponse)
    async getBranchDetailsForPOS(@Args("businessId") businessId: string, @Args('branchId') branchId: string): Promise<BranchResponse> {
        const response = await this.branchService.getBranchDetailsForPOS(businessId, branchId);
        return response;

    }



    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BRANCH, action: PERMISSIONACTION.CREATE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
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
    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BRANCH, action: PERMISSIONACTION.CREATE, resourcTargetName: "businessId" },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async updateBranchInfo(@Args('branchId') branchId: string, @Args('branchInfo') branchInfo: UpdateBranchInput): Promise<BusinessResponse> {
        let branchResult = await this.branchService.updateBranchInfo(branchId, branchInfo.toBranchInfo());
        let response = new BusinessResponseBuilder().withBranchUpdated(branchResult).build();
        return response;
    }



    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BRANCH, action: PERMISSIONACTION.DELETE, resourcTargetName: "branchId", },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ]
    })
    @Mutation(returns => BranchResponse)
    async deleteBranch(@Args("businessId") businessId: string, @Args("branchId") branchId: string) {
        let response = await this.branchService.deleteBranch(businessId, branchId);
        return response;
    }

    // @RequiresPermission({
    //     permissions: [
    //         { resourceType: AppResources.POS, action: PERMISSIONACTION.DELETE, resourcTargetName: "branchId", },
    //         { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
    //     ]
    // })
    @Query(returns => BranchResponse)
    async getPosBranch(@Args("businessId") businessId: string, @Args("branchId") branchId: string): Promise<BranchResponse> {
        let response = await this.branchService.getBranchDetailsForPOS(businessId, branchId);
        return response;
    }




    // ------------------ Nested Queries ------------------

    // responsd for nested query for business field inside branch type
    @ResolveField('business', returns => Business)
    async getBranchBusinesss(@Parent() branchInfo: Branch): Promise<Business> {
        let businessResponse = await this.businessService.getBranchBusiness(branchInfo.id);
        return businessResponse.business
    }

    @ResolveField('products', returns => [Product])
    async getBranchProducts(@Parent() branchInfo: Branch): Promise<Product[]> {
        return await this.productService.getBranchProducts(branchInfo.id);
    }

}