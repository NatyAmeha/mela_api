import { IAccessGenerator } from "@app/common/permission_helper/access_factory.interface";
import { Subscription } from "../model/subscription.model";
import { Access, AccessOwnerType, Permission } from "apps/auth/src/authorization/model/access.model";
import { SubscriptionType } from "../model/subscription_type.enum";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { LanguageKey } from "@app/common/model/localized_model";

export class SubscriptionAccessGenerator implements IAccessGenerator<Subscription> {
    static injectName = "SubscriptionAccessGenerator";
    async createDefaultAccess(subscriptionInfo: Subscription, role?: string): Promise<Access[]> {
        let accesses: Access[] = []
        switch (role) {
            case SubscriptionType.PLATFORM:
                subscriptionInfo.platformServices?.forEach(
                    subscriptionService => {
                        var permissions: Permission[] = []
                        let serviceLevelPermission = new Permission({ resourceType: subscriptionService.serviceName, resourceTarget: subscriptionService.serviceId, })
                        permissions.push(serviceLevelPermission)
                        let customizationPermissions = subscriptionService.selectedCustomizationId.map(id => {
                            return new Permission({ resourceType: PermissionType.PLATFORM_SERVICE_CUSTOMIZATION_PERMISSION, resourceTarget: id })
                        });
                        permissions.push(...customizationPermissions)
                        var accessInfo = new Access({ name: [{ key: LanguageKey.ENGLISH, value: subscriptionService.serviceName }], permissionType: PermissionType.PLATFORM_PERMISSION, owner: subscriptionInfo.owner, ownerType: AccessOwnerType.BUSINESS, permissions: permissions })
                        accesses.push(accessInfo)
                    },
                )
                break;
            default:
                break;
        }
        return accesses;
    }
}