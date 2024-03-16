import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PlatformService } from "../model/platform_service.model";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";

export interface IPlatformServiceRepo {
    createPlatformService(serviceInfo: PlatformService): Promise<PlatformService>
    findPlatfromServices(queryHelper: QueryHelper<PlatformService>): Promise<PlatformService[]>
}
@Injectable()
export class PlatformServiceRepository extends PrismaClient implements IPlatformServiceRepo, OnModuleInit, OnModuleDestroy {
    static InjectName = "PLATFORM_SERVICE_REPOISTORY"
    async onModuleInit() {
        await this.$connect();
    }

    async createPlatformService(serviceInfo: PlatformService): Promise<PlatformService> {
        var result = await this.platformService.create({ data: { ...serviceInfo } });
        return result as PlatformService;
    }

    async findPlatfromServices(queryHelper: QueryHelper<PlatformService>): Promise<PlatformService[]> {
        var result = await this.platformService.findMany({ where: { ...queryHelper.query as any } })
        return result as PlatformService[]
    }


    async onModuleDestroy() {
        await this.$disconnect()
    }

}