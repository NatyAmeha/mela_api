import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { PlatformService } from "../model/platform_service.model";
import { PlatfromUsecase } from "../usecase/platform.usecase";
import { UseGuards } from "@nestjs/common";
import { AuthzGuard } from "libs/common/authorization.guard";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";

@Resolver(of => PlatformService)
export class PlatformServiceResolver {
    constructor(private platformServiceUsecase: PlatfromUsecase) {

    }
    // @UseGuards(AuthzGuard)
    @Mutation(returns => PlatformService)
    async createPlatformService(@Args("serviceInfo") serviceInfo: PlatformService): Promise<PlatformService> {
        // validate the input
        // save the data to db
        var platformServiceInfo = new PlatformService({ ...serviceInfo, name: serviceInfo.name })
        var createdService = await this.platformServiceUsecase.createPlatformService(platformServiceInfo)
        // send notification  
        return createdService;
    }

    @Query(returns => [PlatformService])
    async getPlatformServices(): Promise<PlatformService[]> {
        var queryHelper: QueryHelper<PlatformService> = { query: null }
        var result = await this.platformServiceUsecase.getPlatAllPlatformServices(queryHelper)
        return result;
    }

}