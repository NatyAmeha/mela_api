import { Access, AppResources, Permission } from "apps/auth/src/authorization/model/access.model";
import { filter, isEmpty } from "lodash";
import { PERMISSIONACTION, PermissionEffectType, PermissionResourceType, PermissionTargetType } from "./permission_constants";
import { GqlExecutionContext } from "@nestjs/graphql";
import { PermissionConfiguration, PermissionSelectionCriteria, RequestedPermissionInfo } from "./require_permission.decorator";
import { Injectable } from "@nestjs/common";

export interface IPermissionHelper {
    isPermissionsGranted(userAccesses: Access[], requiredPermission: PermissionConfiguration): boolean
    getResourceTargetFromArgument(gqlContext: GqlExecutionContext): string
    addResourceTargetOnRequestedPermissions(permissions: PermissionConfiguration, resourceTarget?: string): PermissionConfiguration

}
@Injectable()
export class BasePermissionHelper implements IPermissionHelper {
    static InjectName = "Base_Permission_Helper";
    constructor() { }

    isPermissionInGrantedPermissions(grantedPermissions: Permission[], permissionInfo: RequestedPermissionInfo): boolean {
        var matchedPermission = grantedPermissions.filter((gp) => {
            var rr = (gp.resourceType == permissionInfo.resourceType)
                && (gp.action == permissionInfo.action || gp.action == PERMISSIONACTION.ANY)
                && (gp.resourceTarget == permissionInfo.resourceTarget)
            return rr;
        });
        if (matchedPermission.length == 0) {
            return false;
        }
        return !matchedPermission.some(p => p.effect == PermissionEffectType.DENY.toString())
    }


    isPermissionsGranted(userAccesses: Access[], permissionConfiguration: PermissionConfiguration): boolean {
        var grantedPermissions: Permission[] = [];
        userAccesses?.forEach(access => {
            grantedPermissions.push(...access.permissions)
        })
        if (permissionConfiguration.selectionCriteria == PermissionSelectionCriteria.ALL) {
            return permissionConfiguration.permissions.every(p => {
                // role base authorization
                if (p.role) {
                    var accessesbyhRole = filter(userAccesses, access => access.role == p.role)
                    return !isEmpty(accessesbyhRole) ? true : false;
                }
                else {
                    return this.isPermissionInGrantedPermissions(grantedPermissions, p)
                }
            })
        }
        else if (permissionConfiguration.selectionCriteria == PermissionSelectionCriteria.ANY) {
            return permissionConfiguration.permissions.some(p => {
                if (p.role) {
                    var accessesbyhRole = filter(userAccesses, access => access.role == p.role)
                    return !isEmpty(accessesbyhRole) ? true : false;
                }
                else {
                    return this.isPermissionInGrantedPermissions(grantedPermissions, p)
                }
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
        if (permissions.selectionCriteria == null) {
            permissions.selectionCriteria = PermissionSelectionCriteria.ANY;
        }
        return permissions;
    }
}

