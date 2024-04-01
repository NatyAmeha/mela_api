import { Inject, Injectable } from "@nestjs/common";
import { BusinessRepository, IBusinessRepository } from "../repo/business.repo";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { SubscriptionResponse } from "apps/subscription/src/model/subscription.response";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

@Injectable()
export class BusinessService {

    constructor(@Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepository) {

    }
    async createBusiness(data: Business) {
        return await this.businessRepo.createBusiness(data);
    }

    async getBusiness(id: string) {
        return await this.businessRepo.getBusiness(id);
    }

    async updateBusinessInfo(businessId: string, data: Partial<Business>) {
        return await this.businessRepo.updateBusiness(businessId, data);
    }

    async updateBusienssRegistrationToPaymentStage(subscriptionInfo: SubscriptionResponse,) {
        let businessId = subscriptionInfo.createdSubscription.owner
        var businessInfo = await this.businessRepo.getBusiness(businessId);
        if (!businessInfo) {
            throw new RequestValidationException({ message: "Business not found" });
        }
        await this.businessRepo.updateBusiness(businessId, {
            stage: BusinessRegistrationStage.PAYMENT_STAGE,
            trialPeriodUsedServiceIds: [...businessInfo.trialPeriodUsedServiceIds, ...subscriptionInfo.platformServicehavingFreeTrial],
            subscriptionIds: [...subscriptionInfo.createdSubscription.id, ...businessInfo.subscriptionIds]
        });
        return true;
    }

    async getProductBusiness(productId: string): Promise<Business> {
        return await this.businessRepo.getProductBusiness(productId);
    }

    async getBusinessInfoForStaff(staffId: string): Promise<Business> {
        return await this.businessRepo.getBusinessInfoForStaff(staffId);
    }
}