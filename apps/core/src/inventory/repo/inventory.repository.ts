import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { UpdateInventoryInput } from "../../product/dto/inventory.input";
import { PrismaClient } from "apps/core/prisma/generated/prisma_core_client";
import { Inventory } from "../model/inventory.model";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IInventoryRepository {
    updateInventoriesInformation(inventories: UpdateInventoryInput[]): Promise<Inventory[]>;
    addInventoriesOnProduct(productId: string, inventory: Inventory): Promise<Inventory>
    getProductInventories(productId: string, locationId?: string): Promise<Inventory[]>
    getBatchProductInventories(productIds: string[], locationIds?: string[]): Promise<Inventory[]>
    getInventoriesInInventoryLocation(locationId: string): Promise<Inventory[]>;
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

    async addInventoriesOnProduct(productId: string, inventory: Inventory): Promise<Inventory> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const { inventoryLocation, inventoryLocationId, productId, ...restInventoryInfo } = inventory;
                const inventoryCreateResult = await prisma.inventory.create({
                    data: {
                        ...restInventoryInfo,
                        inventoryLocation: {
                            connect: {
                                id: inventoryLocationId
                            }
                        },
                        product: { connect: { id: productId } }
                    }

                });
                return inventoryCreateResult
            });
            return new Inventory({ ...result });
        } catch (error) {
            console.log(error.toString)
            throw new PrismaException({ source: "Add inventory to product", statusCode: 400, code: error.code, meta: error.meta, exception: error });

        }
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

    async getProductInventories(productId: string, locationId?: string): Promise<Inventory[]> {
        try {
            let inventoryResult: any[];
            if (locationId) {
                inventoryResult = await this.inventory.findMany({
                    where: { productId: productId, inventoryLocationId: locationId }
                });
            }
            else {
                inventoryResult = await this.inventory.findMany({
                    where: { productId: productId }
                });
            }
            return inventoryResult.map((inventory) => new Inventory({ ...inventory }));
        } catch (error) {
            console.log(error)
            throw new PrismaException({ source: "Get product inventory by location id", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getBatchProductInventories(productIds: string[], locationIds?: string[]): Promise<Inventory[]> {
        try {
            const inventoryResults = await this.inventory.findMany({
                where: { productId: { in: productIds }, inventoryLocationId: locationIds.length > 0 ? { in: locationIds } : undefined }
            });

            return inventoryResults.map((inventory) => new Inventory({ ...inventory }));
        } catch (error) {
            console.log(error)
            throw new PrismaException({ source: "Get batch product inventories", statusCode: 400, code: error.code, meta: error.meta });

        }
    }

    async getInventoriesInInventoryLocation(locationId: string): Promise<Inventory[]> {
        try {
            const inventoryResults = await this.inventory.findMany({
                where: { inventoryLocationId: locationId }
            });
            return inventoryResults.map((inventory) => new Inventory({ ...inventory }));
        } catch (error) {
            console.log(error)
            throw new PrismaException({ source: "Get product inventory by location id", statusCode: 400, code: error.code, meta: error.meta });
        }
    }


    async onModuleDestroy() {
        await this.$disconnect();
    }
}