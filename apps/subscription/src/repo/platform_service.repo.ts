import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { PlatformService } from "../model/platform_service.model";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IPlatformServiceRepo {
    createPlatformService(serviceInfo: PlatformService): Promise<PlatformService>
    findPlatfromServices(queryHelper: QueryHelper<PlatformService>): Promise<PlatformService[]>
    findPlatformServicesByIds(serviceIds: string[]): Promise<PlatformService[]>
    getPlatformService(platformServiceId: string): Promise<PlatformService | undefined>
    getAllPlatformServices(): Promise<PlatformService[]>

}
@Injectable()
export class PlatformServiceRepository extends PrismaClient implements IPlatformServiceRepo, OnModuleInit, OnModuleDestroy {
    static InjectName = "PLATFORM_SERVICE_REPOISTORY"
    async onModuleInit() {
        await this.$connect();
    }

    async createPlatformService(serviceInfo: PlatformService): Promise<PlatformService> {
        var result = await this.platformService.create({ data: { ...serviceInfo } });
        return new PlatformService({ ...result })
    }

    async findPlatfromServices(queryHelper: QueryHelper<PlatformService>): Promise<PlatformService[]> {
        var result = await this.platformService.findMany({ where: { ...queryHelper.query as any } })
        return result.map(service => new PlatformService({ ...service }))
    }

    async findPlatformServicesByIds(serviceIds: string[]): Promise<PlatformService[]> {
        var result = await this.platformService.findMany({ where: { id: { in: serviceIds } } })
        return result.map(service => new PlatformService({ ...service }))
    }

    async getPlatformService(platformServiceId: string): Promise<PlatformService> {
        var result = await this.platformService.findFirst({ where: { id: platformServiceId } })
        if (!result.id) {
            return undefined
        }
        return new PlatformService({ ...result });
    }

    async getAllPlatformServices(): Promise<PlatformService[]> {
        try {
            var result = await this.platformService.findMany()
            return result.map(service => new PlatformService({ ...service }))
        } catch (error) {
            throw new PrismaException({ source: "Get All platform service", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }


    async onModuleDestroy() {
        await this.$disconnect()
    }

}