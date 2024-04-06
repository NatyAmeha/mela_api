import { Inject, Injectable } from "@nestjs/common"
import { PlatfromServiceSubscription, Subscription } from "../model/subscription.model"
import { IPlatformServiceRepo, PlatformServiceRepository } from "../repo/platform_service.repo"
import { isEmpty } from "class-validator"
import { CreateSubscriptionInput } from "../dto/subscription.input"
import { RequestValidationException } from "@app/common/errors/request_validation_exception"
import { SubscriptionType } from "../model/subscription_type.enum"
import { ISubscritpionRepository, SubscriptionRepository } from "../repo/subscription.repository"
import { SubscriptionResponse } from "../model/subscription.response"

@Injectable()
export class SubscriptionFactory {
    constructor(@Inject(PlatformServiceRepository.InjectName) private platformServiceRepo: IPlatformServiceRepo,
        @Inject(SubscriptionRepository.InjectName) private subscriptionRepo: ISubscritpionRepository,) {

    }
    create(type: string): ISubscriptionOption {
        if (type == SubscriptionType.PLATFORM) {
            return new PlatformSubscriptionOption(this.platformServiceRepo)
        }
        else if (type == SubscriptionType.BUSINESS) {
            return new BusinessSubscriptionOption(this.subscriptionRepo)
        }
    }
}

export interface ISubscriptionOption {
    createSubscriptionInfo(subscriptionInput: CreateSubscriptionInput): Promise<SubscriptionResponse>
}

@Injectable()
export class PlatformSubscriptionOption implements ISubscriptionOption {
    constructor(@Inject(PlatformServiceRepository.InjectName) private platformServiceRepo: IPlatformServiceRepo) {

    }
    async createSubscriptionInfo(subscriptionInput: CreateSubscriptionInput): Promise<SubscriptionResponse> {
        if (!subscriptionInput.selectedPlatformServices || isEmpty(subscriptionInput.selectedPlatformServices)) {
            throw new RequestValidationException({ message: "platform service must be selected" })
        }
        var startDate = new Date(Date.now())

        var serviceSubscriptionInfo = await Promise.all(subscriptionInput.selectedPlatformServices.map(async service => {
            var serviceInfo = await this.platformServiceRepo.getPlatformService(service.serviceId)
            if (serviceInfo) {
                var endDate = new Date(Date.now())
                endDate.setDate(endDate.getDate() + serviceInfo.duration)
                return <PlatfromServiceSubscription>{
                    serviceId: serviceInfo.id,
                    serviceName: service.serviceName,
                    selectedCustomizationId: service.selectedCustomizationId,
                    startDate: startDate,
                    endDate: endDate,
                    isTrialPeriod: serviceInfo.hasTrialPeriod()
                }
            }
        }))
        var subscriptionInfo = new Subscription({
            type: SubscriptionType.PLATFORM,
            owner: subscriptionInput.owner,
            platformServices: serviceSubscriptionInfo,
            isActive: false
        })
        let serviceIdsHavingTrialPeriod = subscriptionInfo.getPlatformServicesHavingFreeTier()
        return new SubscriptionResponse({
            success: true,
            createdSubscription: subscriptionInfo,
            platformServicehavingFreeTrial: serviceIdsHavingTrialPeriod
        });

    }
}

@Injectable()
export class BusinessSubscriptionOption implements ISubscriptionOption {
    constructor(@Inject(SubscriptionRepository.InjectName) private subscriptionRepo: ISubscritpionRepository) {

    }
    async createSubscriptionInfo(subscriptionInput: CreateSubscriptionInput): Promise<SubscriptionResponse> {
        let plan = await this.subscriptionRepo.getSubscriptionPlan(subscriptionInput.subscriptioinPlanId);
        let subscriptionInfo = subscriptionInput.getSubscriptionInfoFromPlan(plan);
        let activeSubscription = await this.subscriptionRepo.getActiveSubscriptions(plan.id, plan.owner);
        if (activeSubscription.length > 0) {
            return <SubscriptionResponse>{
                success: false,
                message: "You already have active subscription for this plan",
                existingActiveSubscriptions: activeSubscription,
                plan: plan
            }
        }
        else {
            let result = await this.subscriptionRepo.createSubscription(subscriptionInfo)
            return <SubscriptionResponse>{
                success: true,
                createdSubscription: result,
                plan: plan
            }
        }
    }
}