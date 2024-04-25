import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { LanguageKey } from "@app/common/model/localized_model";
import { Customization, PlatformService, PlatformServiceType } from "apps/subscription/src/model/platform_service.model";
import { Subscription } from "apps/subscription/src/model/subscription.model";

export interface IResourceUsageTracker {
    getAllowedPlatformServiceCusomizationFromSubscription(subscription: Subscription, platformServices: PlatformService[], requiredAction: string[]): Promise<Customization>
}

export class BaseResourceUsageTracker implements IResourceUsageTracker {
    constructor() {
    }
    async getAllowedPlatformServiceCusomizationFromSubscription(subscription: Subscription, platformServices: PlatformService[], requiredAction: string[]): Promise<Customization> {
        let serviceIdsInSubscription = subscription.getPlatformServiceIdsInSubscription();
        let platformSErvicesInsideSubscription = platformServices.filter(service => serviceIdsInSubscription.includes(service.id));
        let allCustomizationFromPlatformServices = (platformSErvicesInsideSubscription.map(service => service.customizationCategories.map(c => c.customizations)).flat()).flat();
        let allCustomizationsFromSubscription = subscription.getAllCustomizatioInsideSubscription();
        let selectedCustomizations = allCustomizationsFromSubscription.filter(c => requiredAction.includes(c.action));
        let fullCustomizationInfo = allCustomizationFromPlatformServices.find(c => selectedCustomizations.map(s => s.customizationId).includes(c.id));
        return fullCustomizationInfo;
    }

    async isPlatformServiceSubscriptionValid(subscription: Subscription, platformServiceType: PlatformServiceType, platformServices: PlatformService[]): Promise<boolean> {
        let selecteServiceInfo = platformServices.find(service => service.type == platformServiceType);
        if (!selecteServiceInfo) {
            return false;
        }
        let currentDate = new Date(Date.now());
        let selectedPlatformSubscription = subscription.getPlatformServiceSubscription(selecteServiceInfo.id);
        if (!selectedPlatformSubscription) {
            throw new RequestValidationException({ message: `No subscription found for ${selecteServiceInfo.name[LanguageKey.AMHARIC]}` })
        }
        let endDate = new Date(selectedPlatformSubscription.endDate);
        return currentDate < endDate;
    }
}