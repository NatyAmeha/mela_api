import { Access, AppResources, Permission } from "apps/auth/src/authorization/model/access.model";
import { filter } from "lodash";
import { PERMISSIONACTION, PermissionEffectType, PermissionResourceType, PermissionTargetType } from "./permission_constants";

export interface IPermissionHelper {
    isPermissionsGranted(userAccesses: Access[], requiredPermission: Permission, role?: string): boolean

}

export class BasePermissionHelper implements IPermissionHelper {
    static injectName = "BasePermissionHelper";
    isPermissionsGranted(userAccesses: Access[], requiredPermission: Permission, role?: string): boolean {
        var grantedPermissions: Permission[] = [];
        if (role) {
            var accessesWithRole = filter(userAccesses, access => access.role == role)
            accessesWithRole.forEach(access => {
                grantedPermissions.push(...access.permissions)
            })
        }
        else {
            userAccesses?.forEach(access => {
                grantedPermissions.push(...access.permissions)
            })
        }
        var matchedPermission = grantedPermissions.filter((p) => {
            var rr = (p.resourceType == requiredPermission.resourceType)
                && (p.action == requiredPermission.action || p.action == PERMISSIONACTION.ANY)
                && (p.resourceTarget == requiredPermission.resourceTarget)
            console.log("rr", rr);
            return rr;
        })
        if (!matchedPermission.length) {
            return false;
        }
        return !matchedPermission.some(p => p.effect == PermissionEffectType.DENY.toString())

    }
}

