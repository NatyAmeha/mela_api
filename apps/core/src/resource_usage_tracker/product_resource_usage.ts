import { ProductRepository } from "../product/repo/product.repository"
import { ResourceUsage } from "./resource_usage"
import { Inject, Injectable } from "@nestjs/common";
import { PlatformServiceRepository } from "apps/subscription/src/repo/platform_service.repo";
import { CustomizationGateway, PlatformServiceGateway, SubscriptionGateway } from "apps/mela_api/src/model/subscription.gateway.model";
import { AppResources, ProductResourceAction } from "apps/mela_api/src/const/app_resource.constant";

export interface IResourceUsageTracker {
    getAllowedPlatformServiceCusomizationFromSubscription(subscription: SubscriptionGateway, platformServices: PlatformServiceGateway[], requiredAction: string[]): Promise<CustomizationGateway>
}

export class BaseResourceUsageTracker implements IResourceUsageTracker {
    constructor() {

    }
    async getAllowedPlatformServiceCusomizationFromSubscription(subscription: SubscriptionGateway, platformServices: PlatformServiceGateway[], requiredAction: string[]): Promise<CustomizationGateway> {
        let serviceIdsInSubscription = subscription.getPlatformServiceIdsInSubscription();
        let platformSErvicesInsideSubscription = platformServices.filter(service => serviceIdsInSubscription.includes(service.id));
        let allCustomizationFromPlatformServices = (platformSErvicesInsideSubscription.map(service => service.customizationCategories.map(c => c.customizations)).flat()).flat();
        let allCustomizationsFromSubscription = subscription.getAllCustomizatioInsideSubscription();
        let selectedCustomizations = allCustomizationsFromSubscription.filter(c => requiredAction.includes(c.action));
        let fullCustomizationInfo = allCustomizationFromPlatformServices.find(c => selectedCustomizations.map(s => s.customizationId).includes(c.id));
        return fullCustomizationInfo;
    }
}

@Injectable()
export class ProductResourceUsageTracker extends BaseResourceUsageTracker {
    static injectName = "ProductResourceUsageTracker"
    customizationFromAllPlatformservices: CustomizationGateway[] = [];
    constructor(@Inject(ProductRepository.injectName) private productRepo: ProductRepository) {
        super()
    }


    async getBusinessProductCreationUsage(businessId: string, businessSubscription: SubscriptionGateway, platformServices: PlatformServiceGateway[]): Promise<ResourceUsage> {
        var allowedProductCreationActions = Object.values(ProductResourceAction);
        let allowedPlatformServiceCustomizationUsage = await this.getAllowedPlatformServiceCusomizationFromSubscription(businessSubscription, platformServices, allowedProductCreationActions);
        if (!allowedPlatformServiceCustomizationUsage) {
            return <ResourceUsage>{
                success: false,
                message: "Unable to create new product. Upgrade your subscription to add more products",
                resourceId: businessId,
                resourceType: AppResources.PRODUCT,
                usage: 0,
                maxUsage: 0
            }
        }

        let businessProducts = await this.productRepo.getBusinessProducts(businessId);
        let usage = businessProducts.length;
        let maxAllowedUsage = parseInt(allowedPlatformServiceCustomizationUsage.value);
        let canCreateNewProduct = usage < maxAllowedUsage;

        return <ResourceUsage>{
            success: canCreateNewProduct ?? false,
            resourceId: businessId,
            resourceType: AppResources.PRODUCT,
            usage: usage,
            maxUsage: maxAllowedUsage
        }
    }
}