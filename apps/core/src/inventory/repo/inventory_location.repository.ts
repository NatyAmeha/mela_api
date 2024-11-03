import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { InventoryLocation } from "../model/inventory_location.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_core_client";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { CommonBusinessErrorMessages } from "../../utils/const/error_constants";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";

export interface IInventoryLocationRepository {
    createInventoryLocation(location: InventoryLocation): Promise<InventoryLocation>;
    updateInventoryLocationInfo(ocationId: string, location: InventoryLocation)
    getBusinessInventoryLocations(businessId: string, query: QueryHelper<InventoryLocation>): Promise<InventoryLocation[]>;
}

@Injectable()
export class InventoryLocationRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IInventoryLocationRepository {
    static injectName = "InventoryLocationRepository";
    constructor() {
        super();
    }

    async onModuleInit() {
        await this.$connect();
    }

    async createInventoryLocation(location: InventoryLocation): Promise<InventoryLocation> {
        try {
            const branchResult = await this.branch.findUnique({ where: { id: location.branchId } });
            if (!branchResult) {
                throw new RequestValidationException({ message: CommonBusinessErrorMessages.BRANCH_NOT_FOUND, statusCode: 400 });
            }
            const createdLocation = await this.$transaction(async (prisma) => {
                const { branchId, businessId, ...locationData } = location;
                const result = await prisma.inventoryLocation.create({
                    data: {
                        ...locationData,
                        branch: { connect: { id: branchId } },
                        business: { connect: { id: businessId } }
                    }
                });
                return result;
            });
            return new InventoryLocation({ ...createdLocation });
        } catch (error) {
            if (error instanceof RequestValidationException) {
                throw error;
            }
            throw new PrismaException({ source: "Create inventory location", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async updateInventoryLocationInfo(locationId: string, location: InventoryLocation) {
        try {
            const { branchId, businessId, ...locationData } = location;
            const updatedLocation = await this.inventoryLocation.update({
                where: { id: locationId },
                data: {
                    ...locationData,
                    branch: { connect: { id: location.branchId } },
                    business: { connect: { id: location.businessId } }
                }
            });
            return new InventoryLocation({ ...updatedLocation });
        } catch (error) {
            if (error instanceof RequestValidationException) {
                throw error;
            }
            console.log("error", error)
            throw new PrismaException({ source: "Update inventory location", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getBusinessInventoryLocations(businessId: string, query: QueryHelper<InventoryLocation>): Promise<InventoryLocation[]> {
        try {
            const locations = await this.inventoryLocation.findMany({
                where: { businessId },
                skip: query.page * query.limit,
                take: query.limit,
            });
            return locations.map(location => new InventoryLocation({ ...location }));
        } catch (error) {
            throw new PrismaException({ source: "Get business inventory locations", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}