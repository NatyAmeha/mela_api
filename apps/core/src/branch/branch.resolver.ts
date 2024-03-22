import { Injectable } from "@nestjs/common";
import { BranchService } from "./usecase/branch.service";
import { Branch } from "./model/branch.model";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { BusinessResponse } from "../business/model/business.response";
import { Business } from "../business/model/business.model";
import { CreateBranchInput, UpdateBranchInput } from "./dto/branch.input";
import { BusinessService } from "../business/usecase/business.service";

@Resolver(of => Branch)
export class BranchResolver {
    constructor(private branchService: BranchService, private businessService: BusinessService) {
        this.branchService = branchService;
    }
    @Mutation(returns => BusinessResponse)
    async createBranch(@Args('branchInfo') branchInfo: CreateBranchInput): Promise<BusinessResponse> {
        var businessInfo = await this.businessService.getBusiness(branchInfo.businessId);
        var branchResult = await this.branchService.addBranchToBusiness(branchInfo.businessId, branchInfo);
        return {
            success: true,
            business: businessInfo,
            branchAdded: [branchResult]
        }
    }

    @Mutation(returns => BusinessResponse)
    async updateBranchInfo(@Args('branchId') branchId: string, @Args('branchInfo') branchInfo: UpdateBranchInput): Promise<BusinessResponse> {
        var branchResult = await this.branchService.updateBranchInfo(branchId, branchInfo.toBranchInfo());
        return {
            success: true,
            business: null,
            branchUpdated: [branchResult]
        }
    }

}