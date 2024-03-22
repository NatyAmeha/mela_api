import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { BusinessService } from "../usecase/business.service";
import { Business } from "../model/business.model";
import { CreateBusinessInput, UpdateBusinessInput } from "../dto/business.input";
import { BusinessResponse } from "../model/business.response";


@Resolver(of => BusinessResponse)
export class BusinessResolver {
    constructor(private businessService: BusinessService) {
    }
    @Query(returns => BusinessResponse)
    async getBusiness(@Args("id") id: string): Promise<BusinessResponse> {
        let business = await this.businessService.getBusiness(id);
        return {
            success: true,
            business: business
        }
    }

    @Mutation(returns => BusinessResponse)
    async createBusiness(@Args('data') data: CreateBusinessInput): Promise<BusinessResponse> {
        let createdBusiness = await this.businessService.createBusiness(data.toBusiness());
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

    @Mutation(returns => BusinessResponse)
    async updateBusinessRegistrationStage(@Args('businessId') businessId: string, @Args('stage') stage: string): Promise<BusinessResponse> {
        await this.businessService.updateBusienssRegistrationStage(businessId, stage);
        return {
            success: true,
            business: null
        }
    }
} 