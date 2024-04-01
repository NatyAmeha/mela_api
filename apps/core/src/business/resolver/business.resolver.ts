import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BusinessService } from "../usecase/business.service";
import { Business } from "../model/business.model";
import { CreateBusinessInput, UpdateBusinessInput } from "../dto/business.input";
import { BusinessResponse } from "../model/business.response";
import { ProductService } from "../../product/product.service";
import { BranchService } from "../../branch/usecase/branch.service";
import { Product } from "../../product/model/product.model";
import { Branch } from "../../branch/model/branch.model";
import { CoreServiceMsgBrockerClient } from "../../core_service_msg_brocker";
import { AppMsgQueues } from "libs/rmq/constants";
import { IMessageBrockerResponse } from "libs/rmq/message_brocker.response";
import { Access } from "apps/auth/src/authorization/model/access.model";
import { UseGuards } from "@nestjs/common";
import { AuthzGuard } from "libs/common/authorization.guard";


@Resolver(of => Business)
export class BusinessResolver {
    constructor(
        private businessService: BusinessService,
        private productService: ProductService,
        private branchService: BranchService,
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient
    ) {
    }
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
        var businessOwnerAccess = createdBusiness.generateDefaultBusinessOwnerPermission();

        var messageInfo = this.coreServiceMsgBrocker.generateMessageInfoToCreateAccessPermission(businessOwnerAccess, AppMsgQueues.CORE_SERVICE_REPLY_QUEUE);
        var reply = await this.coreServiceMsgBrocker.sendMessageGetReply<Access[], IMessageBrockerResponse>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
        console.log("reply", reply)
        return {
            success: true,
            business: createdBusiness
        }
    }

    @Mutation(returns => BusinessResponse)
    async updateBusinessInfo(@Args('businessId') businessId: string, @Args('data') data: UpdateBusinessInput): Promise<BusinessResponse> {
        var response = await this.businessService.updateBusinessInfo(businessId, data.toBusinessInfo());
        return {
            success: true,
            business: response
        }
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
