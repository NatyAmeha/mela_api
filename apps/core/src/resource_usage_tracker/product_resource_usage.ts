import { ProductRepository } from "../product/repo/product.repository"
import { ResourceUsage } from "./resource_usage"
import { Inject, Injectable } from "@nestjs/common";
import { CustomizationGateway, PlatformServiceGateway } from "apps/mela_api/src/model/subscription.gateway.model";
import { AppResources, ProductResourceAction } from "apps/mela_api/src/const/app_resource.constant";
import { BaseResourceUsageTracker } from "./base_resource_usage_tracker";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { PlatformServiceType } from "apps/subscription/src/model/platform_service.model";
import { CommonSubscriptionErrorMessages } from "../utils/const/error_constants";



@Injectable()
export class ProductResourceUsageTracker extends BaseResourceUsageTracker {
    static injectName = "ProductResourceUsageTracker"
    customizationFromAllPlatformservices: CustomizationGateway[] = [];
    constructor(@Inject(ProductRepository.injectName) private productRepo: ProductRepository) {
        super()
    }


    async getBusinessProductCreationUsage(businessId: string, businessSubscription: Subscription, platformServices: PlatformServiceGateway[]): Promise<ResourceUsage> {
        const allowedProductCreationActions = Object.values(ProductResourceAction);
        let isSubscriptionValid = await this.isPlatformServiceSubscriptionValid(businessSubscription, PlatformServiceType.POINT_OF_SALE, platformServices);
        if (!isSubscriptionValid) {
            return new ResourceUsage({
                success: false,
                message: CommonSubscriptionErrorMessages.UPGRADE_SUBSCRIPTION_TO_USE_THIS_SERVICE,
                resourceId: businessId,
                resourceType: AppResources.PRODUCT,
                usage: 0,
                maxUsage: 0
            })
        }
        let allowedPlatformServiceCustomizationUsage = await this.getAllowedPlatformServiceCusomizationFromSubscription(businessSubscription, platformServices, allowedProductCreationActions);
        if (!allowedPlatformServiceCustomizationUsage) {
            return new ResourceUsage({
                success: false,
                message: "Unable to create new product. Upgrade your subscription to add more products",
                resourceId: businessId,
                resourceType: AppResources.PRODUCT,
                usage: 0,
                maxUsage: 0
            })
        }

        let businessProducts = await this.productRepo.getBusinessProducts(businessId, {});
        let usage = businessProducts.length;
        let maxAllowedUsage = parseInt(allowedPlatformServiceCustomizationUsage.value);
        let canCreateNewProduct = usage < maxAllowedUsage;

        return new ResourceUsage({
            success: canCreateNewProduct ?? false,
            resourceId: businessId,
            resourceType: AppResources.PRODUCT,
            usage: usage,
            maxUsage: maxAllowedUsage
        })
    }
}