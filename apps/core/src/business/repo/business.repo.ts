import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { Business } from "../model/business.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
export interface IBusinessRepository {
    createBusiness(data: Business): Promise<Business>;
    getBusiness(businessId: string): Promise<Business>;
    updateBusiness(businessId: string, updatedBusinessData: Partial<Business>): Promise<Business>;
}

export class BusinessRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IBusinessRepository {
    static injectName = "BusinessRepository";
    constructor() {
        super();
    }
    async createBusiness(data: Business): Promise<Business> {
        const { customers, branches, ...businessData } = data;
        var result = await this.business.create({ data: { ...businessData } });
        return result as Business;
    }

    async getBusiness(businessId: string): Promise<Business> {
        const businessInfo = await this.business.findUnique({ where: { id: businessId } });
        if (!businessInfo) {
            throw new RequestValidationException({ message: "Business not found" });
        }
        return businessInfo as Business;
    }

    async updateBusiness(businessId: string, updatedBusinessData: Partial<Business>): Promise<Business> {
        try {
            const businessInfo = await this.business.findUnique({ where: { id: businessId } });
            if (!businessInfo) {
                throw new RequestValidationException({ message: "Business not found" });
            }
            const { customers, branches, ...businessData } = updatedBusinessData;
            var result = await this.business.update({ where: { id: businessId }, data: { ...businessData } });
            return result as Business;
        }
        catch (error) {
            throw new PrismaException({ source: "Update business", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}