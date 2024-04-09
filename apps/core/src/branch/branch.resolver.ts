import { Injectable } from "@nestjs/common";
import { BranchService } from "./usecase/branch.service";
import { Branch } from "./model/branch.model";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { BusinessResponse, BusinessResponseBuilder } from "../business/model/business.response";
import { Business } from "../business/model/business.model";
import { CreateBranchInput, UpdateBranchInput } from "./dto/branch.input";
import { BusinessService } from "../business/usecase/business.service";
import { BranchResponse } from "./model/branch.response";
import { ProductService } from "../product/product.service";

@Resolver(of => Branch)
export class BranchResolver {
    constructor(private branchService: BranchService, private businessService: BusinessService, private productService: ProductService) {
        this.branchService = branchService;
    }

    @Query(returns => BranchResponse)
    async getBranchDetails(@Args('branchId') branchId: string): Promise<BranchResponse> {
        var branch = await this.branchService.getBranch(branchId);
        var branchProducts = await this.productService.getBranchProducts(branchId);
        return {
            success: true,
            branch: branch,
            products: branchProducts
        }
    }

    @Mutation(returns => BusinessResponse)
    async createBranch(@Args('branchInfo') branchInfo: CreateBranchInput): Promise<BusinessResponse> {
        var businessInfo = await this.businessService.getBusiness(branchInfo.businessId);
        var branchResult = await this.branchService.addBranchToBusiness(branchInfo.businessId, branchInfo);
        var response = new BusinessResponseBuilder().withBusiness(businessInfo).withBranchAdded(branchResult).build();
        return response
    }

    @Mutation(returns => BusinessResponse)
    async updateBranchInfo(@Args('branchId') branchId: string, @Args('branchInfo') branchInfo: UpdateBranchInput): Promise<BusinessResponse> {
        var branchResult = await this.branchService.updateBranchInfo(branchId, branchInfo.toBranchInfo());
        var response = new BusinessResponseBuilder().withBranchUpdated(branchResult).build();
        return response;
    }

}