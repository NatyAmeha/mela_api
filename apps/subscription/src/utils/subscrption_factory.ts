import { Inject, Injectable } from "@nestjs/common"
import { PlatformSubscriptionBuilder, PlatfromServiceSubscription, CustomizationInfo, Subscription } from "../model/subscription.model"
import { IPlatformServiceRepo, PlatformServiceRepository } from "../repo/platform_service.repo"
import { isEmpty } from "class-validator"
import { CreatePlatformSubscriptionInput, SelectedPlatformServiceForSubscription, SubscriptionInput, CreatePlatformSubscriptionInput as SubscritpionInput } from "../dto/platform_service_subscription.input"
import { RequestValidationException } from "@app/common/errors/request_validation_exception"
import { SubscriptionType } from "../model/subscription_type.enum"
import { ISubscritpionRepository, SubscriptionRepository } from "../repo/subscription.repository"
import { SubscriptionResponse } from "../model/response/subscription.response"
import { SubscriptionUpgradeInput } from "../dto/update_subscription.input"
import { Customization, PlatformService } from "../model/platform_service.model"
import { CurrentSubscriptionUpgradeResponse, DowngradePlatformSubscriptionDecorator, SubscriptionUpgradeResponse, UpgradePlatformServiesSubscriptionDecorator } from "../model/response/subscription_upgrade.response"
import { LanguageKey } from "@app/common/model/localized_model"
import { CreateBusinessSubscriptionInput } from "../dto/business.subscription.input"
import { Business } from "apps/core/src/business/model/business.model"
import { sumBy } from "lodash"



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
    getSubscritpionFromObj(subscriptionObj: Subscription): Subscription {
        return new Subscription({ ...subscriptionObj })
    }
}

export interface ISubscriptionOption {
    createSubscriptionInfo(subscriptionInput: SubscriptionInput, businessInfo?: Business): Promise<SubscriptionResponse>
    createSubscriptionInfoFromSubscriptionUpgradeInfo(planInfo: SubscriptionUpgradeResponse): Promise<SubscriptionResponse>
    getSubscriptionUpgradeInfo(subscriiptionInfo: Subscription, platformServices: PlatformService[], subscriptionInput: SubscriptionUpgradeInput): Promise<SubscriptionUpgradeResponse>
}

@Injectable()
export class PlatformSubscriptionOption implements ISubscriptionOption {
    constructor(
        @Inject(PlatformServiceRepository.InjectName) private platformServiceRepo: IPlatformServiceRepo,
    ) {

    }
    async createSubscriptionInfo(subscriptionInput: CreatePlatformSubscriptionInput, businessInfo?: Business): Promise<SubscriptionResponse> {
        if (!subscriptionInput.selectedPlatformServices || isEmpty(subscriptionInput.selectedPlatformServices)) {
            throw new RequestValidationException({ message: "platform service must be selected" })
        }
        let allPlatformServices = await this.platformServiceRepo.getAllPlatformServices()
        if (!allPlatformServices || allPlatformServices.length == 0) {
            throw new RequestValidationException({ message: "Platform service not found to calculate subscription total" })
        }
        let subscriptionResult = new PlatformSubscriptionBuilder(allPlatformServices)
            .generateBaseSubscription(subscriptionInput.owner)
            .addPlatformServices(subscriptionInput, businessInfo)
            .addTotalAmount(subscriptionInput, allPlatformServices)
            .build()
        let serviceIdsHavingTrialPeriod = subscriptionResult.getPlatformServicesHavingFreeTier()
        return new SubscriptionResponse({
            success: true,
            subscription: subscriptionResult,
            platformServicehavingFreeTrial: serviceIdsHavingTrialPeriod
        });
    }

    async createSubscriptionInfoFromSubscriptionUpgradeInfo(upgradeInfo: SubscriptionUpgradeResponse): Promise<SubscriptionResponse> {
        let selectedPlatfromService = upgradeInfo.addedPlatformServices.map(service => {
            let selectedCustomizationFromPlatformService = service.customizationCategories.map(category => category.customizations.map(customization => new CustomizationInfo({ action: customization.actionIdentifier, customizationId: customization.id }))).flat()
            return new SelectedPlatformServiceForSubscription({
                serviceId: service.id,
                serviceName: service.name.find(name => name?.key == LanguageKey.ENGLISH).value ?? "",
                selectedCustomizationInfo: selectedCustomizationFromPlatformService,
            })
        })
        let subscriptionInput = new SubscritpionInput({ selectedPlatformServices: selectedPlatfromService, owner: upgradeInfo.owner })
        let subscriptionResult = await this.createSubscriptionInfo(subscriptionInput)
        return subscriptionResult
    }


    async getSubscriptionUpgradeInfo(subscriiptionInfo: Subscription, platformServices: PlatformService[], subscriptionInput: SubscriptionUpgradeInput): Promise<SubscriptionUpgradeResponse> {
        let baseSubscriptionUpgrade = new CurrentSubscriptionUpgradeResponse({});
        let upgradeSubscriptionDecorator = new UpgradePlatformServiesSubscriptionDecorator(baseSubscriptionUpgrade)
        let downgradePlatformSubscriptionDecorator = new DowngradePlatformSubscriptionDecorator(upgradeSubscriptionDecorator)
        let result = downgradePlatformSubscriptionDecorator.getSubscriptionUpgradeInfo(subscriiptionInfo, platformServices, subscriptionInput)
        return result
    }
}

@Injectable()
export class BusinessSubscriptionOption implements ISubscriptionOption {
    constructor(@Inject(SubscriptionRepository.InjectName) private subscriptionRepo: ISubscritpionRepository) {

    }
    async createSubscriptionInfo(subscriptionInput: CreateBusinessSubscriptionInput, businessInfo?: Business): Promise<SubscriptionResponse> {
        // let plan = await this.subscriptionRepo.getSubscriptionPlan(subscriptionInput.planId);
        // let subscriptionInfo = subscriptionInput.getSubscriptionInfoFromPlan(plan);
        // let activeSubscription = await this.subscriptionRepo.getActiveSubscriptions(plan.id, plan.owner);
        // if (activeSubscription.length > 0) {
        //     return <SubscriptionResponse>{
        //         success: false,
        //         message: "You already have active subscription for this plan",
        //         existingActiveSubscriptions: activeSubscription,
        //         plan: plan
        //     }
        // }
        // else {
        //     let result = await this.subscriptionRepo.createSubscription(subscriptionInfo)
        //     return <SubscriptionResponse>{
        //         success: true,
        //         subscription: result,
        //         plan: plan
        //     }
        // }
        return new SubscriptionResponse({ success: false, message: "Not implemented yet" })
    }

    async getSubscriptionUpgradeInfo(subscriiptionInfo: Subscription, platformServices: PlatformService[], subscriptionInput: SubscriptionUpgradeInput): Promise<SubscriptionUpgradeResponse> {
        return { success: false, price: 0, owner: "" }
    }

    async createSubscriptionInfoFromSubscriptionUpgradeInfo(planInfo: SubscriptionUpgradeResponse): Promise<SubscriptionResponse> {
        return new SubscriptionResponse({ success: false, message: "Not implemented yet" })
    }


}