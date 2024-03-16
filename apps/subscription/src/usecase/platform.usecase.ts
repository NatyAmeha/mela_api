import { Inject, Injectable } from "@nestjs/common";
import { IPlatformServiceRepo, PlatformServiceRepository } from "../repo/platform_service.repo";
import { PlatformService } from "../model/platform_service.model";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";


@Injectable()
export class PlatfromUsecase {
    constructor(@Inject(PlatformServiceRepository.InjectName) private platformServiceRepo: IPlatformServiceRepo) { }

    async createPlatformService(serviceInfo: PlatformService) {
        var result = await this.platformServiceRepo.createPlatformService(serviceInfo);
        return result
    }

    async getPlatAllPlatformServices(queryHelper: QueryHelper<PlatformService>) {
        var result = await this.platformServiceRepo.findPlatfromServices(queryHelper)
        return result;

    }


}