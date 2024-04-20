import { IAccessGenerator } from "@app/common/permission_helper/access_factory.interface";
import { Subscription } from "../model/subscription.model";
import { Access, AccessOwnerType, AppResources, Permission } from "apps/auth/src/authorization/model/access.model";
import { SubscriptionType } from "../model/subscription_type.enum";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { LanguageKey } from "@app/common/model/localized_model";
import { PlatformServiceRepository } from "../repo/platform_service.repo";

export class SubscriptionAccessGenerator implements IAccessGenerator<Subscription> {
    constructor(private platformServiceRepo: PlatformServiceRepository) { }
    static injectName = "SubscriptionAccessGenerator";
    async createAccess(subscriptionInfo: Subscription, role?: string): Promise<Access[]> {
        let accesses: Access[] = []
        var allPlatformServices = await this.platformServiceRepo.getAllPlatformServices();
        switch (role) {
            case SubscriptionType.PLATFORM:
                for await (const serviceInput of subscriptionInfo.platformServices) {
                    var permissions: Permission[] = []
                    var platformService = await allPlatformServices.find(ps => ps.id == serviceInput.serviceId)
                    if (platformService) {
                        let serviceLevelPermission = new Permission({ resourceType: AppResources.PLATFORM_SERVICE_SUBSCRIPTION, resourceTarget: platformService.id, })
                        permissions.push(serviceLevelPermission)
                        serviceInput.selectedCustomizationInfo.forEach(customizationInfo => {
                            let allCustomizationInsideService = platformService.customizationCategories.map(category => category.customizations).flat()
                            let selectedCustomizationInfo = allCustomizationInsideService.find(cst => cst.id == customizationInfo.customizationId)
                            var customizationAccessPermission = new Permission({ resourceType: AppResources.PLATFORM_SERVICE_SUBSCRIPTION, resourceTarget: customizationInfo.customizationId })
                            permissions.push(customizationAccessPermission)
                            var customizationVAluePermission = new Permission({ resourceType: AppResources.PLATFORM_SERVICE_SUBSCRIPTION, resourceTarget: selectedCustomizationInfo.value })
                            permissions.push(customizationVAluePermission)
                        });
                    }
                }
                var accessInfo = new Access({ name: [{ key: LanguageKey.ENGLISH, value: "Platform service Access" }], permissionType: PermissionType.PLATFORM_SERVICE_ACCESS_PERMISSION, owner: subscriptionInfo.owner, ownerType: AccessOwnerType.BUSINESS, permissions: permissions })
                accesses.push(accessInfo)
                break;
            default:
                break;
        }
        return accesses;
    }

}