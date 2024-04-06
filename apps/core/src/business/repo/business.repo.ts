import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { Business } from "../model/business.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
export interface IBusinessRepository {
    createBusiness(data: Business): Promise<Business>;
    getBusiness(businessId: string): Promise<Business>;
    updateBusiness(businessId: string, updatedBusinessData: Partial<Business>): Promise<Business>;
    updatedBusinessRegistrationStage(businessId: string, stage: string, { subscriptionId, trialPeriodUsedServiceIds }: { subscriptionId?: string, trialPeriodUsedServiceIds?: string[] }): Promise<Business>;
    getProductBusiness(productId: string): Promise<Business>;
    getBusinessInfoForStaff(staffId: string): Promise<Business>;

}

export class BusinessRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IBusinessRepository {
    static injectName = "BusinessRepository";
    constructor() {
        super();
    }
    async createBusiness(data: Business): Promise<Business> {
        const { customers, branches, staffs, products, ...businessData } = data;
        var result = await this.business.create({ data: { ...businessData } });
        return new Business({ ...result })
    }

    async getBusiness(businessId: string): Promise<Business> {
        const businessInfo = await this.business.findUnique({ where: { id: businessId } });
        if (!businessInfo) {
            throw new RequestValidationException({ message: "Business not found" });
        }
        return new Business({ ...businessInfo });
    }

    async updateBusiness(businessId: string, updatedBusinessData: Partial<Business>): Promise<Business> {
        try {
            const businessInfo = await this.business.findUnique({ where: { id: businessId } });
            if (businessInfo) {
                throw new RequestValidationException({ message: "Business not found" });
            }
            const { customers, branches, products, staffs, ...businessData } = updatedBusinessData;
            var result = await this.business.update({ where: { id: businessId }, data: { ...businessData } });
            if (!result.id) {
                throw new RequestValidationException({ message: "Business not updated" });
            }
            return new Business({ ...result });
        }
        catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Update business", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async updatedBusinessRegistrationStage(businessId: string, stage: string, { subscriptionId, trialPeriodUsedServiceIds }: { subscriptionId?: string, trialPeriodUsedServiceIds?: string[] }): Promise<Business> {
        try {
            const businessInfo = await this.business.findUnique({ where: { id: businessId } });
            if (!businessInfo) {
                throw new RequestValidationException({ message: "Business not found" });
            }
            var result = await this.business.update({ where: { id: businessId }, data: { stage: stage, trialPeriodUsedServiceIds: { push: trialPeriodUsedServiceIds }, subscriptionIds: [subscriptionId, ...businessInfo.subscriptionIds] } });
            if (!result.id) {
                throw new RequestValidationException({ message: "Business not updated" });
            }
            return new Business({ ...result });
        } catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Update business registration stage", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getProductBusiness(productId: string): Promise<Business> {
        try {
            const product = await this.product.findUnique({ where: { id: productId } });
            if (!product) {
                throw new RequestValidationException({ message: "Product not found" });
            }
            const business = await this.business.findUnique({ where: { id: product.businessId } });
            if (!business) {
                throw new RequestValidationException({ message: "Business not found" });
            }
            return new Business({ ...business });
        } catch (error) {
            throw new PrismaException({ source: "Get product business", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getBusinessInfoForStaff(staffId: string): Promise<Business> {
        try {
            const staff = await this.staff.findUnique({ where: { id: staffId } });
            if (!staff) {
                throw new RequestValidationException({ message: "Staff not found", statusCode: 404 });
            }
            const business = await this.business.findUnique({ where: { id: staff.businessId } });
            if (!business) {
                throw new RequestValidationException({ message: "Business not found", statusCode: 404 });
            }
            return new Business({ ...business });
        } catch (error) {
            throw new PrismaException({ source: "Get business info for staff", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}