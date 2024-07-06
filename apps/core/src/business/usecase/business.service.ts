import { Inject, Injectable } from "@nestjs/common";
import { BusinessRepository, IBusinessRepository } from "../repo/business.repo";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { SubscriptionResponse } from "apps/subscription/src/model/response/subscription.response";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { BusinessResponse, BusinessResponseBuilder } from "../model/business.response";
import { BusinessSection, CreateBusinessSectionInput } from "../model/business_section.model";
import { BaseResponse } from "@app/common/model/base.response";
import { plainToClass } from "class-transformer";
import { PaymentOption } from "../model/payment_option.model";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { CreatePaymentOptionInput } from "../dto/payment_option.input";
import { CommonBusinessErrorMessages } from "../../utils/const/error_constants";
import { CoreServiceMsgBrockerClient } from "../../msg_brocker_client/core_service_msg_brocker";

@Injectable()
export class BusinessService {
    // try-catch block  must be used on the methods that handles message broker message/event
    constructor(
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepository,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator) {

    }
    async createBusiness(data: Business) {
        return await this.businessRepo.createBusiness(data);
    }

    async getBusinessDetails(id: string) {
        const businessResult = await this.businessRepo.getBusiness(id);
        await this.businessRepo.updateBusinessStats(businessResult.id, { totalViews: businessResult.totalViews + 1 })
        return businessResult;
    }

    async isBusinessExist(businessId: string): Promise<boolean> {
        const businessInfo = await this.getBusinessDetails(businessId);
        return businessInfo.id ? true : false;
    }

    async getBusinessResponse(id: string): Promise<BusinessResponse> {
        try {
            let business = await this.getBusinessDetails(id);
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

    async addPaymentOptions(businessId: string, paymentOptions: CreatePaymentOptionInput[]): Promise<BusinessResponse> {
        await this.inputValidator.validateArrayInput(paymentOptions, CreatePaymentOptionInput);
        const businessInfo = await this.getBusinessDetails(businessId)
        if (!businessInfo.id) {
            return new BusinessResponseBuilder().withError(CommonBusinessErrorMessages.BUSINESS_NOT_FOUND);
        }
        if (this.isPaymentOptionExistBefore(businessInfo, paymentOptions)) {
            return new BusinessResponseBuilder().withError(CommonBusinessErrorMessages.PAYMENT_OPTION_ALREADY_EXIST);
        }
        let newPaymentOptionsResult = await this.businessRepo.addPaymentOptionToBusiness(businessId, paymentOptions);
        const result = new BusinessResponseBuilder().withPaymentOptions(newPaymentOptionsResult).build();
        return result
    }

    async removePaymentOption(businessId: string, paymentOptionId: string[]): Promise<BusinessResponse> {
        let response = await this.businessRepo.removePaymentOptionFromBusiness(businessId, paymentOptionId);
        const result = new BusinessResponseBuilder().basicResponse(response);
        return result as BusinessResponse;
    }

    async updatePaymentOption(businessId: string, paymentOption: PaymentOption): Promise<BusinessResponse> {
        let response = await this.businessRepo.updatePaymentOption(businessId, paymentOption);
        const result = new BusinessResponseBuilder().basicResponse(response);
        return result as BusinessResponse;
    }

    isPaymentOptionExistBefore(businessInfo: Business, paymentOptions: PaymentOption[]): boolean {
        if (businessInfo.paymentOptions.length === 0) {
            return false;
        }
        const result = paymentOptions.every(newOption => {
            return businessInfo.paymentOptions.every(option => {
                const newPaymentOptionData = new PaymentOption({ name: newOption.name, type: newOption.type, dueDate: newOption.dueDate ?? null, upfrontPayment: newOption.upfrontPayment ?? null })
                const paymentOptionData = new PaymentOption({ name: option.name, type: option.type, dueDate: option.dueDate ?? null, upfrontPayment: option.upfrontPayment ?? null })
                console.log("option comparison", newPaymentOptionData, paymentOptionData)
                return !this.inputValidator.isObjectAreEqual(newPaymentOptionData, paymentOptionData)
            })
        })
        return !result;
    }

    async getBusinessPaymentOptions(businessId: string, paymentOptionId?: string[]): Promise<PaymentOption[]> {
        const businessInfo = await this.getBusinessDetails(businessId);
        if (!businessInfo.id) {
            return [];
        }
        if (!paymentOptionId) {
            return businessInfo.paymentOptions;
        }
        return businessInfo.paymentOptions.filter(option => paymentOptionId.includes(option.id));
    }

}  