import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { UpdateInventoryInput } from "../../product/dto/inventory.input";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { Inventory } from "../model/inventory.model";

export interface IInventoryRepository {
    updateInventoriesInformation(inventories: UpdateInventoryInput[]): Promise<Inventory[]>;
}

@Injectable()
export class InventoryRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IInventoryRepository {
    static injectName = "InventoryRepository";
    constructor() {
        super();
    }

    async onModuleInit() {
        await this.$connect();
    }

    async updateInventoriesInformation(inventories: UpdateInventoryInput[]): Promise<Inventory[]> {
        const updatedInventories = await this.$transaction(async (prisma) => {
            const inventoryResults = await Promise.all(inventories?.map(async (inventory) => {
                const { id, ...inventoryData } = inventory;
                const result = await prisma.inventory.update({
                    where: { id },
                    data: {
                        ...inventoryData
                    }
                });
                return result;
            }));
            return inventoryResults;
        });
        return updatedInventories.map((inventory) => new Inventory({ ...inventory }));
    }


    async onModuleDestroy() {
        await this.$disconnect();
    }
}