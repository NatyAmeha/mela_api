import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BusinessService } from "../usecase/business.service";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { BusinessResponse, BusinessResponseBuilder } from "../model/business.response";
import { ProductService } from "../../product/usecase/product.service";
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
import { CreatePaymentOptionInput } from "../dto/payment_option.input";
import { CreatePriceListInput, UpdatePriceListInput } from "../../product/dto/price_list.input";
import { ProductBundle } from "../../product/model/product_bundle.model";
import { BundleService } from "../../product/usecase/bundle.service";
import { MembershipResponse } from "apps/subscription/src/membership/dto/membership.response";


@Resolver(of => Business)
export class BusinessResolver {
    constructor(
        private businessService: BusinessService,
        private productService: ProductService,
        private branchService: BranchService,
        private bundleService: BundleService,
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient,
        @Inject(BusinessAccessGenerator.injectName) private businessAccessGenerator: IAccessGenerator<Business>
    ) {
    }


    @Query(returns => BusinessResponse)
    async getBusinessDetails(@Args("id") id: string, @Args("branchId", { nullable: true }) branchId?: string): Promise<BusinessResponse> {
        let business = await this.businessService.getBusinessDetails(id);
        let featuredProducts = await this.productService.getBusinessProducts(id, { query: { featured: true }, page: 1, limit: 20 }, branchId);
        let businessBranches = await this.branchService.getBusinessBranches(id);
        // let businessBundles = await this.bundleService.getBusinessBundles(id, branchId);
        // business.bundles = businessBundles;
        let respnse = new BusinessResponseBuilder().withBusiness(business).withProducts(featuredProducts).withBranches(businessBranches).build();
        return respnse;
    }

    @Query(returns => BusinessResponse)
    async getBusinesSectionsDetails(@Args("businessId") businessId: string, @Args("sectionId") sectionId: string, @Args("branchId", { nullable: true }) branchId?: string): Promise<BusinessResponse> {
        let sectionResult = await this.businessService.getBusinessSectionDetails(businessId, { sectionId, branchId });
        return sectionResult;
    }

    @Query(returns => MembershipResponse)
    @UseGuards(AuthzGuard)
    @Mutation(returns => BusinessResponse)
    async createBusiness(@Args('data') data: CreateBusinessInput): Promise<BusinessResponse> {
        let createdBusiness = await this.businessService.createBusiness(data.toBusiness());
        let businessOwnerAccess = await this.businessAccessGenerator.createAccess(createdBusiness, DefaultRoles.BUSINESS_OWNER);
        let reply = await this.coreServiceMsgBrocker.sendCreateAccessPermissionMessage(businessOwnerAccess);
        console.log("reply", reply)
        let response = new BusinessResponseBuilder().withBusiness(createdBusiness).build();
        return response;
    }

    @Query(returns => BusinessResponse)
    async getBusinessByWorkspaceUrl(@Args("workspaceUrl") workspaceUrl: string): Promise<BusinessResponse> {
        let business = await this.businessService.getBusinessByWorkspaceUrl(workspaceUrl);
        let response = new BusinessResponseBuilder().withBusiness(business).build();
        return response;
    }


    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.CREATE, resourcTargetName: "businessId" }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async createBusinessSection(@Args("businessId") businessId: string, @Args({ name: "sections", type: () => [CreateBusinessSectionInput] }) sections: CreateBusinessSectionInput[]): Promise<BaseResponse> {
        let result = await this.businessService.createBusienssSections(businessId, sections);
        return result;
    }

    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.DELETE, resourcTargetName: "businessId" }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BaseResponse)
    async removeBusinessSection(@Args("businessId") businessId: string, @Args({ name: "sectionsId", type: () => [String] }) sectionId: string[]): Promise<BaseResponse> {
        let result = await this.businessService.removeBusinessSection(businessId, sectionId);
        return result;
    }


    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.UPDATE, resourcTargetName: "businessId" }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async updateBusinessInfo(@Args('businessId') businessId: string, @Args('data') data: UpdateBusinessInput): Promise<BusinessResponse> {
        let businessResult = await this.businessService.updateBusinessInfo(businessId, data.toBusinessInfo());
        let response = new BusinessResponseBuilder().withBusiness(businessResult).build();
        return response;
    }



    @UseGuards(AuthzGuard)
    @Mutation(returns => BusinessResponse)
    async verifyBusinessRegistration(@Args('businessId') businessId: string): Promise<BusinessResponse> {
        let result = await this.businessService.checkBusinessRegistrationFlow(businessId);
        return result;
    }

    // @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.READ }] })
    @UseGuards(AuthzGuard)
    @Query(returns => BusinessResponse)
    async getUserBusinesses(@CurrentUser() userInfo: User): Promise<BusinessResponse> {
        let response = await this.businessService.getUserOwnedBusinesses(userInfo.id);
        return response;
    }


    // Payment option opereration
    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.UPDATE, resourcTargetName: "businessId" }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async addPaymentOptions(@Args("businessId") businessId: string, @Args({ name: "paymentOptions", type: () => [CreatePaymentOptionInput] }) paymentOptions: CreatePaymentOptionInput[]): Promise<BusinessResponse> {
        let result = await this.businessService.addPaymentOptions(businessId, paymentOptions);
        return result;

    }




    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.UPDATE, resourcTargetName: "businessId" }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async deletePaymentOption(@Args("businessId") businessId: string, @Args({ name: "paymentOptionsId", type: () => [String] }) paymentOptionsId: string[]): Promise<BusinessResponse> {
        let response = await this.businessService.removePaymentOption(businessId, paymentOptionsId);
        return response;
    }

    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.UPDATE, resourcTargetName: "businessId" }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async addPriceListTobusiness(@Args("businessId") businessId: string, @Args({ name: "input", type: () => [CreatePriceListInput] }) input: CreatePriceListInput[]): Promise<BusinessResponse> {
        let response = await this.businessService.createBusinessPriceList(businessId, input);
        return response;
    }


    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.UPDATE, resourcTargetName: "businessId" }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async updateBusinessPriceList(@Args("businessId") businessId: string, @Args({ name: "input", type: () => [UpdatePriceListInput] }) input: UpdatePriceListInput[]): Promise<BusinessResponse> {
        let response = await this.businessService.updatePriceList(businessId, input);
        return response;
    }

    @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.DELETE, resourcTargetName: "businessId" }] })
    @UseGuards(PermissionGuard)
    @Mutation(returns => BusinessResponse)
    async deleteBusinessPriceLlist(@Args("businessId") businessId: string, @Args({ name: "priceListIds", type: () => [String] }) priceListIds: string[]): Promise<BusinessResponse> {
        let response = await this.businessService.deletePriceList(businessId, priceListIds);
        return response;
    }


    @Query(returns => BusinessResponse)
    async getBusinessesFromOrder(@Args({ name: "businessIds", type: () => [String] }) businessIds: string[]): Promise<BusinessResponse> {
        let response = await this.businessService.getBusinessesInfoForOrder(businessIds);
        return response;
    }


    // ------------------ Nested Queries ------------------

    // responsd for nested query for products field inside business type
    @ResolveField('products', returns => [Product])
    async getProductsforBusiness(@Parent() business: Business): Promise<Product[]> {
        console.log("business product resolver")
        return await this.productService.getBusinessProducts(business.id, {});
    }

    @ResolveField('bundles', returns => [ProductBundle])
    async getBundlesForBusiness(@Parent() business: Business, @Args('branchId', { nullable: true }) branchId?: string): Promise<ProductBundle[]> {
        console.log("business bundle resolver")
        return await this.bundleService.getBusinessBundles([business.id], branchId);
    }

    // responsd for nested query for branches field inside business type
    @ResolveField('branches', returns => [Branch])
    async getBranchesForBusiness(@Parent() business: Business): Promise<Branch[]> {
        return await this.branchService.getBusinessBranches(business.id);
    }
} 
