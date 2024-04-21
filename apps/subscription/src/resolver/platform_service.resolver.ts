import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PlatformService, CreatePlatformServiceInput } from "../model/platform_service.model";
import { PlatfromUsecase } from "../usecase/platform.usecase";
import { UseGuards } from "@nestjs/common";
import { AuthzGuard, Role, RoleGuard } from "libs/common/authorization.guard";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { AccountType } from "apps/auth/src/auth/model/user.model";
import { PlatformSErviceResponseBuilder, PlatformServiceResponse } from "../model/response/platform_service.response";

@Resolver(of => [PlatformService, PlatformServiceResponse])
export class PlatformServiceResolver {
    constructor(private platformServiceUsecase: PlatfromUsecase) {

    }
    @Role(AccountType.ADMIN)
    @UseGuards(RoleGuard)
    @Mutation(returns => PlatformServiceResponse)
    async createPlatformService(@Args("serviceInfo") serviceInfo: CreatePlatformServiceInput): Promise<PlatformServiceResponse> {
        // validate the input
        // save the data to db
        let platformServiceInfo = new PlatformService({ ...serviceInfo })
        let response = await this.platformServiceUsecase.createPlatformService(platformServiceInfo)
        return response;
    }

    @Query(returns => [PlatformService])
    async getPlatformServices(): Promise<PlatformService[]> {
        let queryHelper: QueryHelper<PlatformService> = { query: null }
        let result = await this.platformServiceUsecase.getPlatAllPlatformServices(queryHelper)
        return result;
    }
}