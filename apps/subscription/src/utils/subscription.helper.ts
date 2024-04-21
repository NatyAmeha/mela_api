import { Access, AccessOwnerType, Permission } from "apps/auth/src/authorization/model/access.model"
import { PlatfromServiceSubscription, Subscription } from "../model/subscription.model"
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum"
import { LanguageKey } from "@app/common/model/localized_model"
import { Inject, Injectable } from "@nestjs/common"
import { IPlatformServiceRepo, PlatformServiceRepository } from "../repo/platform_service.repo"
import { SelectedPlatformServiceForSubscription, CreatePlatformSubscriptionInput } from "../dto/platform_service_subscription.input"
import { isEmpty } from "lodash"
import { RequestValidationException } from "@app/common/errors/request_validation_exception"
import { SubscriptionType } from "../model/subscription_type.enum"


@Injectable()
export class SubscriptionHelper {
    constructor(@Inject(PlatformServiceRepository.InjectName) private platformServiceRepo: IPlatformServiceRepo) {

    }

    async getSubscriptionInfoForPlatformService(subscriptionInput: CreatePlatformSubscriptionInput) {
        if (!subscriptionInput.selectedPlatformServices || isEmpty(subscriptionInput.selectedPlatformServices)) {
            throw new RequestValidationException({ message: "platform service must be selected" })
        }
        var startDate = new Date(Date.now())

        var serviceSubscriptionInfo = await Promise.all(subscriptionInput.selectedPlatformServices.map(async service => {
            var serviceInfo = await this.platformServiceRepo.getPlatformService(service.serviceId)
            if (serviceInfo) {
                var endDate = new Date(Date.now())
                var selectedRenewalInfo = serviceInfo.subscriptionRenewalInfo.find(info => info.id == service.selectedRenewalId)
                endDate.setDate(endDate.getDate() + selectedRenewalInfo.duration)
                return <PlatfromServiceSubscription>{
                    serviceId: serviceInfo.id,
                    serviceName: service.serviceName,
                    selectedCustomizationInfo: service.selectedCustomizationInfo,
                    startDate: startDate,
                    endDate: endDate,
                    createdAt: new Date(Date.now()),
                    updatedAt: new Date(Date.now()),
                    isTrialPeriod: serviceInfo.hasTrialPeriod(service.selectedRenewalId)
                }
            }
        }))
        return new Subscription({
            type: SubscriptionType.PLATFORM,
            owner: subscriptionInput.owner,
            createdAt: startDate,
            updatedAt: startDate,
            platformServices: serviceSubscriptionInfo,
            isActive: false
        })
    }




}