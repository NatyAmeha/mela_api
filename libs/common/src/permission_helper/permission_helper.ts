import { Access, AccessOwnerType, AppResources, Permission } from "apps/auth/src/authorization/model/access.model";
import { filter, isEmpty } from "lodash";
import { PERMISSIONACTION, PermissionEffectType, PermissionResourceType, PermissionTargetType } from "./permission_constants";
import { GqlExecutionContext } from "@nestjs/graphql";
import { PermissionConfiguration, PermissionSelectionCriteria, RequestedPermissionInfo } from "./require_permission.decorator";
import { Injectable } from "@nestjs/common";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { SubscriptionType } from "apps/subscription/src/model/subscription_type.enum";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";

export interface IPermissionHelper {
    isPermissionsGranted(grantedPermissions: Permission[], requiredPermission: PermissionConfiguration): boolean
    getResourceTargetFromArgument(gqlContext: GqlExecutionContext): string
    getSubscriptionPermissionList(subscriptionInfo: Subscription): Promise<Permission[]>
    addResourceTargetOnRequestedPermissions(permissions: PermissionConfiguration, resourceTarget?: string): PermissionConfiguration

}
@Injectable()
export class BasePermissionHelper implements IPermissionHelper {
    static InjectName = "Base_Permission_Helper";
    constructor() { }

    isPermissionInGrantedPermissions(grantedPermissions: Permission[], permissionInfo: RequestedPermissionInfo): boolean {
        var matchedPermission = grantedPermissions.filter((gp) => {
            var hasAccess = (gp.resourceType == permissionInfo.resourceType)
                && (gp.action == permissionInfo.action || gp.action == PERMISSIONACTION.ANY)
                && (permissionInfo.resourceTarget != undefined ? gp.resourceTarget == permissionInfo.resourceTarget : true)
            return hasAccess;
        });
        if (matchedPermission.length == 0) {
            return false;
        }
        return !matchedPermission.some(p => p.effect == PermissionEffectType.DENY.toString())
    }


    isPermissionsGranted(grantedPermissions: Permission[], permissionConfiguration: PermissionConfiguration): boolean {

        if (permissionConfiguration.selectionCriteria == null) {
            permissionConfiguration.selectionCriteria = PermissionSelectionCriteria.ANY;
        }

        if (permissionConfiguration.selectionCriteria == PermissionSelectionCriteria.ALL) {
            return permissionConfiguration.permissions.every(p => {
                // role base authorization
                // if (p.role) {
                //     var accessesbyhRole = filter(userAccesses, access => access.role == p.role)
                //     return !isEmpty(accessesbyhRole) ? true : false;
                // }
                // else {
                // }
                return this.isPermissionInGrantedPermissions(grantedPermissions, p)
            })
        }
        else if (permissionConfiguration.selectionCriteria == PermissionSelectionCriteria.ANY) {
            return permissionConfiguration.permissions.some(p => {
                // if (p.role) {
                //     var accessesbyhRole = filter(userAccesses, access => access.role == p.role)
                //     return !isEmpty(accessesbyhRole) ? true : false;
                // }
                // else {
                // }
                return this.isPermissionInGrantedPermissions(grantedPermissions, p)
            })
        }
        return false;
    }

    getResourceTargetFromArgument(gqlContext: GqlExecutionContext): string {
        var args = gqlContext.getArgs();
        // one of them should be present in the mutation/query arguments
        return args.owner ?? args.ownerId ?? args.businessId ?? args.userId ?? args.id
    }

    addResourceTargetOnRequestedPermissions(permissions: PermissionConfiguration, resourceTarget?: string): PermissionConfiguration {
        if (!resourceTarget) {
            return permissions;
        }
        permissions.permissions.forEach(p => {
            p.resourceTarget = resourceTarget;
        })

        return permissions;
    }

    async getSubscriptionPermissionList(subscriptionInfo: Subscription): Promise<Permission[]> {
        var permissions: Permission[] = []
        // Subscription level permissions
        let subscriptionPermission = new Permission({ resourceType: AppResources.PLATFORM_SERVICE_SUBSCRIPTION, resourceTarget: subscriptionInfo.id, })
        permissions.push(subscriptionPermission)
        // Platform service subscription permissions
        subscriptionInfo.platformServices?.forEach(
            subscriptionService => {
                let serviceLevelPermission = new Permission({ resourceType: AppResources.PLATFORM_SERVICE_SUBSCRIPTION, resourceTarget: subscriptionService.serviceId, })
                permissions.push(serviceLevelPermission)
                let customizationPermissions = subscriptionService.selectedCustomizationInfo.map(customizationInfo => {
                    return new Permission({ resourceType: AppResources.PLATFORM_SERVICE_SUBSCRIPTION, resourceTarget: customizationInfo.customizationId })
                });
                permissions.push(...customizationPermissions)
            },
        )
        return permissions
    }
}

