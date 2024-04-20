import { Inject, Injectable } from "@nestjs/common";
import { IPlatformServiceRepo, PlatformServiceRepository } from "../repo/platform_service.repo";
import { PlatformService } from "../model/platform_service.model";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { PlatformSErviceResponseBuilder } from "../model/response/platform_service.response";


@Injectable()
export class PlatfromUsecase {
    constructor(@Inject(PlatformServiceRepository.InjectName) private platformServiceRepo: IPlatformServiceRepo) { }

    async createPlatformService(serviceInfo: PlatformService) {
        let result = await this.platformServiceRepo.createPlatformService(serviceInfo);
        return new PlatformSErviceResponseBuilder().withService(result).build();
    }

    async getPlatAllPlatformServices(queryHelper: QueryHelper<PlatformService>) {
        let result = await this.platformServiceRepo.findPlatfromServices(queryHelper)
        return result;
    }


}