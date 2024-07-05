import { Permission } from "apps/auth/src/authorization/model/access.model";
import { filter, isEmpty } from "lodash";
import { PERMISSIONACTION, PermissionEffectType, PermissionResourceType, PermissionTargetType } from "./permission_constants";
import { GqlExecutionContext } from "@nestjs/graphql";
import { PermissionConfiguration, PermissionSelectionCriteria, RequestedPermissionInfo } from "./require_permission.decorator";
import { Injectable } from "@nestjs/common";
import { Subscription } from "apps/subscription/src/model/subscription.model";
import { SubscriptionType } from "apps/subscription/src/model/subscription_type.enum";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { ResourceTargetIdentifier } from "../utils/resource_target_constants";

export interface IPermissionHelper {
    isPermissionsGranted(grantedPermissions: Permission[], requiredPermission: PermissionConfiguration): boolean
    getResourceTargetFromArgument(gqlContext: GqlExecutionContext): { key: string, value: any }[]
    getSubscriptionPermissionList(subscriptionInfo: Subscription): Promise<Permission[]>
    addResourceTargetOnRequestedPermissions(permissions: PermissionConfiguration, resourceTarget?: { key: string, value: any }[]): PermissionConfiguration

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

    getResourceTargetFromArgument(gqlContext: GqlExecutionContext): { key: string, value: any }[] {
        var args = gqlContext.getArgs();
        // one of them should be present in the mutation/query arguments
        // possible parameter key-value provided inside resolver method. to get resource target by key
        var resourceTargetProvided: { key: string, value: any }[] = [
            { key: ResourceTargetIdentifier.OWNER, value: args.owner },
            { key: ResourceTargetIdentifier.OWNERID, value: args.ownerId },
            { key: ResourceTargetIdentifier.BUSINESSID, value: args.businessId },
            { key: ResourceTargetIdentifier.PRODUCTID, value: args.productId },
            { key: ResourceTargetIdentifier.USERID, value: args.userId },
            { key: ResourceTargetIdentifier.ID, value: args.id },
            { key: ResourceTargetIdentifier.SUBSCRIPTIONID, value: args.subscriptionId },
            { key: ResourceTargetIdentifier.MEMBERSHIPID, value: args.membershipId },
        ]
        return resourceTargetProvided.filter(target => target.value != undefined)
    }

    addResourceTargetOnRequestedPermissions(permissions: PermissionConfiguration, resourceTargets?: { key: string, value: any }[]): PermissionConfiguration {
        if (!resourceTargets) {
            return permissions;
        }
        permissions.permissions.forEach(p => {
            p.resourceTarget = resourceTargets.find(rs => rs.key == p.resourcTargetName)?.value
        })

        console.log("provided permissions", permissions.permissions)
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

