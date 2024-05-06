import { Inject, Injectable } from "@nestjs/common";
import { BusinessRepository, IBusinessRepository } from "../repo/business.repo";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { SubscriptionResponse } from "apps/subscription/src/model/response/subscription.response";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { BusinessResponse, BusinessResponseBuilder } from "../model/business.response";
import { BusinessSection, CreateBusinessSectionInput } from "../model/business_section.model";
import { BaseResponse } from "@app/common/model/base.response";
import { plainToClass } from "class-transformer";

@Injectable()
export class BusinessService {
    // try-catch block  must be used on the methods that handles message broker message/event
    constructor(@Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepository) {

    }
    async createBusiness(data: Business) {
        return await this.businessRepo.createBusiness(data);
    }

    async getBusiness(id: string) {
        return await this.businessRepo.getBusiness(id);
    }

    async getBusinessResponse(id: string): Promise<BusinessResponse> {
        try {
            let business = await this.getBusiness(id);
            return new BusinessResponse({ business: business, success: true });
        } catch (error) {
            return new BusinessResponse({ success: false, message: "Business not found" });
        }
    }

    async updateBusinessInfo(businessId: string, data: Partial<Business>) {
        return await this.businessRepo.updateBusiness(businessId, data);
    }

    async handleUpdateBusienssSubscriptionEvent(subscriptionInfo: SubscriptionResponse,): Promise<BusinessResponse> {
        try {
            let businessId = subscriptionInfo.subscription.owner
            var updatedBusinessInfo = await this.businessRepo.updatedBusinessSubscriptionInfo(
                businessId, BusinessRegistrationStage.PAYMENT_STAGE,
                {
                    canActivate: false,
                    subscriptionId: subscriptionInfo.subscription.id,
                    trialPeriodUsedServiceIds: subscriptionInfo.platformServicehavingFreeTrial
                }
            );
            return new BusinessResponse({ business: updatedBusinessInfo, success: true });
        } catch (error) {
            return new BusinessResponse({ success: false, message: "Unable to update business registration stage" });
        }
    }

    async createBusienssSections(businessId: string, sections: CreateBusinessSectionInput[]): Promise<BusinessResponse | BaseResponse> {
        let businessSectionInfo = sections?.map(section => CreateBusinessSectionInput.toBusinessSection(section));
        let response = await this.businessRepo.createBusinessSection(businessId, businessSectionInfo);
        if (response.success) {
            return new BusinessResponseBuilder().basicResponse(response.success, response.message);
        }
    }

    async removeBusinessSection(businessId: string, sectionIds: string[]) {
        let response = await this.businessRepo.removeBusinessSection(businessId, sectionIds);
        return new BusinessResponseBuilder().basicResponse(response.success, response.message);
    }




    async checkBusinessRegistrationFlow(businessId: string): Promise<BusinessResponse> {
        var result = await this.businessRepo.updatedBusinessSubscriptionInfo(businessId, BusinessRegistrationStage.COMPLETED, { canActivate: true });
        return new BusinessResponse({ business: result, success: true });
    }


    async getProductBusiness(productId: string): Promise<Business> {
        return await this.businessRepo.getProductBusiness(productId);
    }

    async getBranchBusiness(branchId: string): Promise<BusinessResponse> {
        return await this.businessRepo.getBranchBusiness(branchId);
    }

    async getBusinessInfoForStaff(staffId: string): Promise<Business> {
        return await this.businessRepo.getBusinessInfoForStaff(staffId);
    }

    async getUserOwnedBusinesses(userId: string): Promise<BusinessResponse> {
        let userBusinessResult = await this.businessRepo.getUserOwnedBusinesses(userId);
        return userBusinessResult;
    }
}