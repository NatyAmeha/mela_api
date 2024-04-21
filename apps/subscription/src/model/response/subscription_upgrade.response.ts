import { BaseResponse } from "@app/common/model/base.response"
import { Field, Float, ObjectType } from "@nestjs/graphql"
import { PlatformService } from "../platform_service.model"
import { SubscriptionUpgradeInput } from "../../dto/update_subscription.input"
import { PlatfromServiceSubscription, Subscription } from "../subscription.model"
import { sumBy } from "lodash"
import { CreatePlatformSubscriptionInput } from "../../dto/platform_service_subscription.input"
import { type } from "os"
import { SubscriptionType } from "../subscription_type.enum"


@ObjectType()
export class SubscriptionUpgradeResponse extends BaseResponse {
    @Field()
    owner: string
    @Field(type => Float)
    price: number = 0;
    @Field(type => [PlatformService])
    addedPlatformServices?: PlatformService[] = []
    @Field(type => [PlatformService])
    removedPlatformServices?: PlatformService[] = []

    constructor(data: Partial<SubscriptionUpgradeResponse>) {
        super()
        Object.assign(this, data)
    }
}

export interface SubscriptionUpgradeDecorator {
    getSubscriptionUpgradeInfo(subscription: Subscription, platformServices: PlatformService[], subscriptionInput: SubscriptionUpgradeInput): SubscriptionUpgradeResponse
}

export class CurrentSubscriptionUpgradeResponse extends SubscriptionUpgradeResponse implements SubscriptionUpgradeDecorator {
    getSubscriptionUpgradeInfo(subscription: Subscription, platformServices: PlatformService[], subscriptionInput: SubscriptionUpgradeInput): SubscriptionUpgradeResponse {
        try {
            let platformServieIdsInsideSubscription: string[] = []
            let platformServicesInsideSubscriptionWithSelectedCustomization: PlatformService[] = []
            let totalPrice = 0;

            subscription.platformServices.forEach(service => {
                let fullServiceInfo = platformServices.find(serviceInfo => serviceInfo.id == service.serviceId)
                let allCustomizationInsideService = fullServiceInfo.customizationCategories.map(customizationCategory => customizationCategory.customizations).flat()

                let selectedCustomizationIds = service.selectedCustomizationInfo.map(customization => customization.customizationId)
                let selectedCustomizationsInfo = allCustomizationInsideService.filter(customization => selectedCustomizationIds.includes(customization.id))

                totalPrice += fullServiceInfo.basePrice;
                totalPrice += sumBy(selectedCustomizationsInfo, customization => customization.additionalPrice)

                // select customization categories atleast one customization is selected
                fullServiceInfo.customizationCategories = fullServiceInfo.customizationCategories.filter(category => category.customizations.some(customization => selectedCustomizationIds.includes(customization.id)))
                // select customizations that are selected by current subscription
                fullServiceInfo.customizationCategories.forEach(category => {
                    category.customizations = category.customizations.filter(customization => selectedCustomizationIds.includes(customization.id))
                })
                platformServieIdsInsideSubscription.push(service.serviceId)
            })
            return new SubscriptionUpgradeResponse({ success: true, price: totalPrice, owner: subscriptionInput.businessId, addedPlatformServices: platformServicesInsideSubscriptionWithSelectedCustomization })
        } catch (ex) {
            return new SubscriptionUpgradeResponse({ success: false, message: ex, price: 0, owner: subscriptionInput.businessId })
        }
    }
}

export class UpgradePlatformServiesSubscriptionDecorator extends SubscriptionUpgradeResponse implements SubscriptionUpgradeDecorator {
    constructor(protected subscriptionUpgradDecorator: SubscriptionUpgradeDecorator) {
        super({})
    }
    getSubscriptionUpgradeInfo(subscription: Subscription, platformServices: PlatformService[], subscriptionInput: SubscriptionUpgradeInput): SubscriptionUpgradeResponse {
        try {
            let subscriptionUpgradeResponse = this.subscriptionUpgradDecorator.getSubscriptionUpgradeInfo(subscription, platformServices, subscriptionInput)
            // console.log("subscription upgrade", subscriptionUpgradeResponse)

            var totalPrice = 0;
            subscriptionInput.addedServices?.forEach(service => {
                let serviceSubscription: PlatfromServiceSubscription;
                var serviceInfo = platformServices.find(serviceInfo => serviceInfo.id == service.serviceId)
                if (serviceInfo) {
                    // add base price if service is not in subscription
                    serviceSubscription = subscription.platformServices.find(subscriptionService => subscriptionService.serviceId == service.serviceId)
                    if (!serviceSubscription) {
                        totalPrice += serviceInfo.basePrice
                    }
                    // add customization price that is not part of current subscription
                    let allCustomizationInsideService = serviceInfo.customizationCategories.map(customizationCategory => customizationCategory.customizations).flat()
                    let customizationIdsExistInSubscription = (serviceSubscription?.selectedCustomizationInfo ?? []).map(customization => customization.customizationId)
                    let newCustomizationIdToAdd = service.selectedCustomizationInfo?.map(customizationInfo => customizationInfo.customizationId).filter(customizationId => !customizationIdsExistInSubscription.includes(customizationId))

                    let newCustomizationsInfo = allCustomizationInsideService.filter(customization => newCustomizationIdToAdd.includes(customization.id))
                    let totalCustomizationPrice = sumBy(newCustomizationsInfo, customization => customization.additionalPrice)
                    totalPrice += totalCustomizationPrice

                    subscriptionUpgradeResponse.price += totalPrice

                    if (!serviceSubscription) {
                        subscriptionUpgradeResponse.addedPlatformServices.push(serviceInfo)
                    }
                    let index = subscriptionUpgradeResponse.addedPlatformServices?.findIndex(serviceInfo => serviceInfo.id == service.serviceId)
                    if (index > -1) {
                        let platformServiceToUpdate = subscriptionUpgradeResponse.addedPlatformServices[index]
                        platformServiceToUpdate.customizationCategories = platformServiceToUpdate.customizationCategories.filter(category => category.customizations.some(customization => newCustomizationIdToAdd.includes(customization.id)))
                        platformServiceToUpdate.customizationCategories.forEach(category => {
                            category.customizations = category.customizations.filter(customization => newCustomizationIdToAdd.includes(customization.id))
                        })
                        subscriptionUpgradeResponse.addedPlatformServices[index] = platformServiceToUpdate
                    }
                }
            });
            subscriptionUpgradeResponse.success = true
            return subscriptionUpgradeResponse;
        } catch (ex) {
            return new SubscriptionUpgradeResponse({ success: false, message: ex, price: 0, owner: subscriptionInput.businessId })
        }


    }
}

export class DowngradePlatformSubscriptionDecorator extends SubscriptionUpgradeResponse implements SubscriptionUpgradeDecorator {
    constructor(protected subscriptionUpgradDecorator: SubscriptionUpgradeDecorator) {
        super({})
    }
    getSubscriptionUpgradeInfo(subscription: Subscription, platformServices: PlatformService[], subscriptionInput: SubscriptionUpgradeInput): SubscriptionUpgradeResponse {
        try {
            let subscriptionUpgradeResponse = this.subscriptionUpgradDecorator.getSubscriptionUpgradeInfo(subscription, platformServices, subscriptionInput)
            // console.log("subscription downgrade", subscriptionUpgradeResponse)

            var totalPrice = 0;
            subscriptionInput.removedServices?.forEach(service => {
                let serviceExistInSubscription = subscription.platformServices.find(subscriptionService => subscriptionService.serviceId == service.serviceId)
                if (serviceExistInSubscription) {
                    let serviceInfo = platformServices.find(serviceInfo => serviceInfo.id == service.serviceId)
                    if (serviceInfo) {
                        totalPrice += serviceInfo.basePrice
                    }

                    // Remove customization price
                    let allCustomizationInsideService = serviceInfo.customizationCategories.map(customizationCategory => customizationCategory.customizations).flat()

                    let selectedServicecustomizationIdsInsideSubscription = serviceExistInSubscription.selectedCustomizationInfo.map(customization => customization.customizationId)
                    let selectedCustomizationsInfo = allCustomizationInsideService.filter(customization => selectedServicecustomizationIdsInsideSubscription.includes(customization.id))
                    let totalCustomizationPrice = sumBy(selectedCustomizationsInfo, customization => customization.additionalPrice)
                    totalPrice += totalCustomizationPrice
                    serviceInfo.customizationCategories = serviceInfo.customizationCategories.filter(category => category.customizations.some(customization => selectedServicecustomizationIdsInsideSubscription.includes(customization.id)))
                    serviceInfo.customizationCategories.forEach(category => {
                        category.customizations = category.customizations.filter(customization => selectedServicecustomizationIdsInsideSubscription.includes(customization.id))
                    })
                    subscriptionUpgradeResponse.price -= totalPrice;
                    subscriptionUpgradeResponse.removedPlatformServices?.push(serviceInfo)
                }
            });
            subscriptionUpgradeResponse.success = true
            return subscriptionUpgradeResponse;
        } catch (ex) {
            return new SubscriptionUpgradeResponse({ success: false, message: ex, price: 0, owner: subscriptionInput.businessId })
        }
    }
}