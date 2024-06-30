import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { CommonBusinessErrorMessages } from "../../utils/const/error_constants";
import { BusinessResponse, BusinessResponseBuilder } from "../model/business.response";
import { includes, isEqual, uniq, uniqBy, uniqWith } from "lodash";
import { BusinessSection } from "../model/business_section.model";
import { PaymentOption } from "../model/payment_option.model";
import { Stat } from "../../product/model/product_stat.model";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
export interface IBusinessRepository {
    createBusiness(data: Business): Promise<Business>;
    getBusiness(businessId: string): Promise<Business>;
    findBusinesses(query: QueryHelper<Business>): Promise<Business[]>;
    findBusinessesById(businessIds: string[]): Promise<Business[]>;

    updateBusiness(businessId: string, updatedBusinessData: Partial<Business>): Promise<Business>;
    updatedBusinessSubscriptionInfo(businessId: string, stage: string, { canActivate, subscriptionId, trialPeriodUsedServiceIds }?: { canActivate?: boolean, subscriptionId?: string, trialPeriodUsedServiceIds?: string[] }): Promise<Business>;
    getProductBusiness(productId: string): Promise<Business>;
    getBranchBusiness(branchId: string): Promise<BusinessResponse>;
    getBusinessInfoForStaff(staffId: string): Promise<Business>;
    getUserOwnedBusinesses(userId: string): Promise<BusinessResponse>;

    createBusinessSection(businessId: string, sections: BusinessSection[]): Promise<BusinessResponse>
    removeBusinessSection(businessId: string, sectionIds: string[]): Promise<BusinessResponse>

    addPaymentOptionToBusiness(businessId: string, newPaymentOptions: PaymentOption[]): Promise<PaymentOption[]>
    removePaymentOptionFromBusiness(businessId: string, paymentOptionIds: string[]): Promise<boolean>
    updatePaymentOption(businessId: string, paymentOption: PaymentOption): Promise<boolean>

    updateBusinessStats(businessId: string, stats: Partial<Stat>): Promise<boolean>
}

export class BusinessRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IBusinessRepository {
    static injectName = "BusinessRepository";
    constructor() {
        super();
    }

    async updateBusinessStats(businessId: string, stats: Partial<Stat>): Promise<boolean> {
        try {
            const result = await this.business.update({ where: { id: businessId }, data: { totalViews: stats.totalViews } });
            return true;
        } catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Update business stats", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async createBusiness(data: Business): Promise<Business> {
        const { customers, branches, staffs, products, bundles, ...businessData } = data;
        var result = await this.business.create({ data: { ...businessData } });
        return new Business({ ...result })
    }

    async createBusinessSection(businessId: string, newSections: BusinessSection[]): Promise<BusinessResponse> {
        try {
            const business = await this.business.findUnique({ where: { id: businessId } });
            if (!business) {
                return new BusinessResponseBuilder().withError(CommonBusinessErrorMessages.BUSINESS_NOT_FOUND);
            }
            const alreadyExistingSections = (business.sections ?? []) as BusinessSection[];
            const filteredNewSections = newSections.filter((section) => {
                var name = section.name.map((name) => name.value).join(" ");
                var rsult = alreadyExistingSections.some((existingSection) => {
                    let existingSectionName = existingSection.name.map((name) => name.value).join(" ");
                    let result = isEqual(existingSectionName, name);
                    console.log("is exist ", result, existingSectionName, name)
                    return result;
                });
                return !rsult;
            });
            const businessUpdateResult = await this.business.update({
                where: { id: businessId },
                data: { sections: { push: filteredNewSections } }
            });
            return new BusinessResponseBuilder().withBusiness(new Business({ ...businessUpdateResult })).build();

        } catch (error) {
            throw new PrismaException({ source: "Create business section", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async removeBusinessSection(businessId: string, sectionIds: string[]): Promise<BusinessResponse> {
        try {
            const business = await this.business.findUnique({ where: { id: businessId } });
            console.log("business info", business.name);
            if (!business) {
                return new BusinessResponseBuilder().withError(CommonBusinessErrorMessages.BUSINESS_NOT_FOUND);
            }
            const alreadyExistingSections = business.sections;
            const remainingSections = alreadyExistingSections.filter((section) => !sectionIds.includes(section.id));
            const businessUpdateResult = await this.business.update({
                where: { id: businessId },
                data: { sections: { set: remainingSections } }
            });
            return new BusinessResponseBuilder().withBusiness(new Business({ ...businessUpdateResult })).build();

        } catch (error) {
            console.log("remove business section error", error)
            throw new PrismaException({ source: "Remove business section", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getBusiness(businessId: string): Promise<Business> {
        try {
            const businessInfo = await this.business.findUnique({ where: { id: businessId } });
            if (!businessInfo) {
                throw new RequestValidationException({ message: "Business not found" });
            }
            return new Business({ ...businessInfo });
        } catch (error) {
            throw new PrismaException({ source: "Remove business section", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async findBusinesses(query: QueryHelper<Business>): Promise<Business[]> {
        try {
            const businesses = await this.business.findMany({ where: { ...query.query as any } });
            return businesses.map(business => new Business({ ...business }));
        } catch (ex) {
            throw new PrismaException({ source: "Find businesses", statusCode: 400, code: ex.code, meta: ex.meta });
        }
    }

    async findBusinessesById(businessIds: string[]): Promise<Business[]> {
        try {
            const businesses = await this.business.findMany({ where: { id: { in: businessIds } } });
            return businesses.map(business => new Business({ ...business }));
        } catch (ex) {
            throw new PrismaException({ source: "Find businesses by id", statusCode: 400, code: ex.code, meta: ex.meta });
        }
    }

    async updateBusiness(businessId: string, updatedBusinessData: Partial<Business>): Promise<Business> {
        try {
            const businessInfo = await this.business.findUnique({ where: { id: businessId } });
            if (!businessInfo) {
                throw new RequestValidationException({ message: "Business not found" });
            }
            const { customers, branches, products, staffs, bundles, ...businessData } = updatedBusinessData;
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

    async addPaymentOptionToBusiness(businessId: string, newPaymentOptions: PaymentOption[]): Promise<PaymentOption[]> {
        try {
            const business = await this.business.findUnique({ where: { id: businessId } });
            if (!business) {
                throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUSINESS_NOT_FOUND });
            }
            const result = await this.business.update({ where: { id: businessId }, data: { paymentOptions: { push: newPaymentOptions } } });
            return newPaymentOptions;
        } catch (error) {
            console.log("error", error)
            if (error instanceof RequestValidationException) {
                throw error;
            }
            throw new PrismaException({ source: "Add payment option to business", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async removePaymentOptionFromBusiness(businessId: string, paymentOptionIds: string[]): Promise<boolean> {
        try {
            const business = await this.business.findUnique({ where: { id: businessId } });
            if (!business) {
                throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUSINESS_NOT_FOUND });
            }
            const remainingPaymentOptions = business.paymentOptions.filter((paymentOption) => !paymentOptionIds.includes(paymentOption.id));
            const result = await this.business.update({ where: { id: businessId }, data: { paymentOptions: { set: remainingPaymentOptions } } });
            return true;
        } catch (error) {
            if (error instanceof RequestValidationException) {
                throw error;
            }
            throw new PrismaException({ source: "Remove payment option from business", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async updatePaymentOption(businessId: string, paymentOption: PaymentOption): Promise<boolean> {
        try {
            if (!paymentOption.id) {
                throw new RequestValidationException({ message: "Payment option id is missing" });
            }
            const business = await this.business.findUnique({ where: { id: businessId } });
            if (!business) {
                throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUSINESS_NOT_FOUND });
            }
            const updatedOptions = business.paymentOptions.map((option) => {
                if (option.id === paymentOption.id) {
                    return { ...option, ...paymentOption };
                }
                return option;
            });
            const result = await this.business.update({ where: { id: businessId }, data: { paymentOptions: { set: updatedOptions } } });
            return true;
        } catch (error) {
            if (error instanceof RequestValidationException) {
                throw error;
            }
            throw new PrismaException({ source: "Update payment option", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}