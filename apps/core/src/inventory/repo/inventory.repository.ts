import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

export interface IInventoryRepository { }

@Injectable()
export class InventoryRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IInventoryRepository {
    static injectName = "InventoryRepository";
    constructor() {
        super();
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}