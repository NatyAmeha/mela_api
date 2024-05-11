import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BusinessService } from "../usecase/business.service";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { BusinessResponse, BusinessResponseBuilder } from "../model/business.response";
import { ProductService } from "../../product/product.service";
import { BranchService } from "../../branch/usecase/branch.service";
import { Product } from "../../product/model/product.model";
import { Branch } from "../../branch/model/branch.model";
import { CoreServiceMsgBrockerClient } from "../../msg_brocker_client/core_service_msg_brocker";
import { AppMsgQueues, ExchangeTopics } from "libs/rmq/const/constants";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { Access, DefaultRoles, Permission } from "apps/auth/src/authorization/model/access.model";
import { Inject, UseGuards } from "@nestjs/common";
import { AuthzGuard } from "libs/common/authorization.guard";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { PermissionSelectionCriteria, RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { PERMISSIONACTION, PermissionResourceType } from "@app/common/permission_helper/permission_constants";
import { CurrentUser } from "libs/common/get_user_decorator";
import { User } from "apps/auth/prisma/generated/prisma_auth_client";
import { BusinessAccessGenerator } from "../business_access_factory";
import { IAccessGenerator } from "@app/common/permission_helper/access_factory.interface";
import { CreateBusinessInput, UpdateBusinessInput } from "../dto/business.input";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { CreateBusinessSectionInput } from "../model/business_section.model";
import { BaseResponse } from "@app/common/model/base.response";


@Resolver(of => Business)
export class BusinessResolver {
    constructor(
        private businessService: BusinessService,
        private productService: ProductService,
        private branchService: BranchService,
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient,
        @Inject(BusinessAccessGenerator.injectName) private businessAccessGenerator: IAccessGenerator<Business>
    ) {
    }


    @Query(returns => BusinessResponse)
    async getBusinessDetails(@Args("id") id: string): Promise<BusinessResponse> {
        let business = await this.businessService.getBusiness(id);
        var businessProducts = await this.productService.getBusinessProducts(id, { page: 1, limit: 20 });
        var businessBranches = await this.branchService.getBusinessBranches(id);
        var respnse = new BusinessResponseBuilder().withBusiness(business).withProducts(businessProducts).withBranches(businessBranches).build();
        return respnse;
    }


    @UseGuards(AuthzGuard)
    @Mutation(returns => BusinessResponse)
    async createBusiness(@Args('data') data: CreateBusinessInput): Promise<BusinessResponse> {
        let createdBusiness = await this.businessService.createBusiness(data.toBusiness());
        let businessOwnerAccess = await this.businessAccessGenerator.createAccess(createdBusiness, DefaultRoles.BUSINESS_OWNER);
        let reply = await this.coreServiceMsgBrocker.sendCreateAccessPermissionMessage(businessOwnerAccess);
        console.log("reply", reply)
        var response = new BusinessResponseBuilder().withBusiness(createdBusiness).build();
        return response;
    }


    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BaseResponse)
    async createBusinessSection(@Args("businessId") businessId: string, @Args({ name: "sections", type: () => [CreateBusinessSectionInput] }) sections: CreateBusinessSectionInput[]): Promise<BaseResponse> {
        let result = await this.businessService.createBusienssSections(businessId, sections);
        return result;
    }

    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BaseResponse)
    async removeBusinessSection(@Args("businessId") businessId: string, @Args({ name: "sectionsId", type: () => [String] }) sectionId: string[]): Promise<BaseResponse> {
        let result = await this.businessService.removeBusinessSection(businessId, sectionId);
        return result;
    }


    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.UPDATE }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async updateBusinessInfo(@Args('id') businessId: string, @Args('data') data: UpdateBusinessInput): Promise<BusinessResponse> {
        var businessResult = await this.businessService.updateBusinessInfo(businessId, data.toBusinessInfo());
        var response = new BusinessResponseBuilder().withBusiness(businessResult).build();
        return response;
    }



    @UseGuards(AuthzGuard)
    @Mutation(returns => BusinessResponse)
    async verifyBusinessRegistration(@Args('businessId') businessId: string): Promise<BusinessResponse> {
        let result = await this.businessService.checkBusinessRegistrationFlow(businessId);
        return result;
    }

    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.READ }] })
    @UseGuards(PermissionGuard)
    @Query(returns => BusinessResponse)
    async getUserBusinesses(@CurrentUser() userInfo: User): Promise<BusinessResponse> {
        let response = await this.businessService.getUserOwnedBusinesses(userInfo.id);
        return response;
    }


    // @Mutation(returns => BusinessResponse)
    // async updateBusinessRegistrationStage(@Args('businessId') businessId: string, @Args('stage') stage: string): Promise<BusinessResponse> {
    //     await this.businessService.updateBusienssRegistrationStage(businessId, stage);
    //     return {
    //         success: true,
    //         business: null
    //     }
    // }


    // ------------------ Nested Queries ------------------

    // responsd for nested query for products field inside business type
    @ResolveField('products', returns => [Product])
    async getProductsforBusiness(@Parent() business: Business): Promise<Product[]> {
        return await this.productService.getBusinessProducts(business.id, {});
    }

    // responsd for nested query for branches field inside business type
    @ResolveField('branches', returns => [Branch])
    async getBranchesForBusiness(@Parent() business: Business): Promise<Branch[]> {
        return await this.branchService.getBusinessBranches(business.id);
    }
} 
