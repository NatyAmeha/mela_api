import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BusinessService } from "../usecase/business.service";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { CreateBusinessInput, UpdateBusinessInput } from "../dto/business.input";
import { BusinessResponse } from "../model/business.response";
import { ProductService } from "../../product/product.service";
import { BranchService } from "../../branch/usecase/branch.service";
import { Product } from "../../product/model/product.model";
import { Branch } from "../../branch/model/branch.model";
import { CoreServiceMsgBrockerClient } from "../../core_service_msg_brocker";
import { AppMsgQueues, ExchangeTopics } from "libs/rmq/constants";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { Access, DefaultRoles } from "apps/auth/src/authorization/model/access.model";
import { Inject, UseGuards } from "@nestjs/common";
import { AuthzGuard } from "libs/common/authorization.guard";
import { AccessFactory, IAccessFactory } from "../../../../../libs/common/src/permission_helper/access_factory.interface";


@Resolver(of => Business)
export class BusinessResolver {
    constructor(
        private businessService: BusinessService,
        private productService: ProductService,
        private branchService: BranchService,
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient,
        @Inject(AccessFactory.injectName) private accessFactory: IAccessFactory
    ) {
    }
    @UseGuards(AuthzGuard)
    @Query(returns => BusinessResponse)
    async getBusinessDetails(@Args("id") id: string): Promise<BusinessResponse> {
        let business = await this.businessService.getBusiness(id);
        var businessProducts = await this.productService.getBusinessProducts(id);
        var businessBranches = await this.branchService.getBusinessBranches(id);
        return {
            success: true,
            business: business,
            products: businessProducts,
            branches: businessBranches
        }
    }
    // @UseGuards(AuthzGuard)
    @Mutation(returns => BusinessResponse)
    async createBusiness(@Args('data') data: CreateBusinessInput): Promise<BusinessResponse> {
        let createdBusiness = await this.businessService.createBusiness(data.toBusiness());
        let businessOwnerAccess = await this.accessFactory.getBusinessAccessGenerator().createDefaultAccess(createdBusiness, DefaultRoles.BUSINESS_OWNER);

        let reply = await this.coreServiceMsgBrocker.sendCreateAccessPermissionMessage(businessOwnerAccess);
        console.log("reply", reply)
        return {
            success: true,
            business: createdBusiness
        }
    }
    @UseGuards(AuthzGuard)
    @Mutation(returns => BusinessResponse)
    async updateBusinessInfo(@Args('businessId') businessId: string, @Args('data') data: UpdateBusinessInput): Promise<BusinessResponse> {
        var response = await this.businessService.updateBusinessInfo(businessId, data.toBusinessInfo());
        return {
            success: true,
            business: response
        }
    }

    @Mutation(returns => BusinessResponse)
    async changeBusinessRegistrationStatus(@Args('businessId') businessId: string, @Args('stage', { type: () => BusinessRegistrationStage }) stage: BusinessRegistrationStage): Promise<BusinessResponse> {
        let result = await this.businessService.updateBusinessRegistrationStage(businessId, stage);
        return result;
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
        return await this.productService.getBusinessProducts(business.id);
    }

    // responsd for nested query for branches field inside business type
    @ResolveField('branches', returns => [Branch])
    async getBranchesForBusiness(@Parent() business: Business): Promise<Branch[]> {
        return await this.branchService.getBusinessBranches(business.id);
    }
} 
