import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { CommonBusinessErrorMessages } from "../../utils/const/error_constants";
import { BusinessResponse, BusinessResponseBuilder } from "../model/business.response";
import { uniq, uniqBy, uniqWith } from "lodash";
export interface IBusinessRepository {
    createBusiness(data: Business): Promise<Business>;
    getBusiness(businessId: string): Promise<Business>;
    updateBusiness(businessId: string, updatedBusinessData: Partial<Business>): Promise<Business>;
    updatedBusinessSubscriptionInfo(businessId: string, stage: string, { canActivate, subscriptionId, trialPeriodUsedServiceIds }?: { canActivate?: boolean, subscriptionId?: string, trialPeriodUsedServiceIds?: string[] }): Promise<Business>;
    getProductBusiness(productId: string): Promise<Business>;
    getBranchBusiness(branchId: string): Promise<BusinessResponse>;
    getBusinessInfoForStaff(staffId: string): Promise<Business>;
    getUserOwnedBusinesses(userId: string): Promise<BusinessResponse>;

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
            if (!businessInfo) {
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

    async updatedBusinessSubscriptionInfo(businessId: string, stage: string, { canActivate, subscriptionId, trialPeriodUsedServiceIds }: { canActivate?: boolean, subscriptionId?: string, trialPeriodUsedServiceIds?: string[] }): Promise<Business> {
        try {
            const businessInfo = await this.business.findUnique({ where: { id: businessId } });
            if (!businessInfo) {
                throw new RequestValidationException({ message: "Business not found" });
            }

            let result
            if (subscriptionId && trialPeriodUsedServiceIds) {
                var trialPeriodUsedServiceIds = uniq([...businessInfo.trialPeriodUsedServiceIds, ...trialPeriodUsedServiceIds]);
                var businessSubscriptionIds = uniq([...businessInfo.subscriptionIds, subscriptionId]);
                result = await this.business.update({
                    where: { id: businessId }, data: {
                        stage: stage,
                        isActive: canActivate,
                        trialPeriodUsedServiceIds: trialPeriodUsedServiceIds,
                        activeSubscriptionId: subscriptionId,
                        subscriptionIds: businessSubscriptionIds
                    }
                });
            }
            else {
                result = await this.business.update({ where: { id: businessId }, data: { stage: stage, isActive: canActivate, } });
            }

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

    async getBranchBusiness(branchId: string): Promise<BusinessResponse> {
        try {
            const branch = await this.branch.findUnique({ where: { id: branchId } });
            if (!branch) {
                return new BusinessResponseBuilder().withError(CommonBusinessErrorMessages.BRANCH_NOT_FOUND);
            }
            const business = await this.business.findUnique({ where: { id: branch.businessId } });
            if (!business) {
                return new BusinessResponseBuilder().withError(CommonBusinessErrorMessages.BUSINESS_NOT_FOUND);
            }
            let businessInfo = new Business({ ...business });
            return new BusinessResponseBuilder().withBusiness(businessInfo).build();
        } catch (error) {
            throw new PrismaException({ source: "Get branch business", statusCode: 400, code: error.code, meta: error.meta });
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

    async getUserOwnedBusinesses(userId: string): Promise<BusinessResponse> {
        try {
            const businesses = await this.business.findMany({ where: { creator: userId } });
            let finalBusinessList = businesses.map(business => new Business({ ...business }));
            return new BusinessResponseBuilder().withBusinesses(finalBusinessList).build();
        } catch (error) {
            if (error instanceof RequestValidationException) {
                throw error;
            }
            throw new PrismaException({ source: "Get user owned businesses", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}