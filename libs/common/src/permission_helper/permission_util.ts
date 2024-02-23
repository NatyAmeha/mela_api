import { Access, Permission } from "apps/auth/src/authorization/model/access.model";
import { filter } from "lodash";
import { PERMISSIONACTION, PermissionEffectType, PermissionResourceType, PermissionTargetType } from "./permission_constants";

export const isPermissionsGranted = (userAccesses: Access[], requiredPermission: Permission, role?: string) => {
    var grantedPermissions: Permission[] = [];
    if (role) {
        var accessesWithRole = filter(userAccesses, access => access.role == role)
        accessesWithRole.forEach(access => {
            grantedPermissions.push(...access.permissions)
        })
    }
    else {
        userAccesses.forEach(access => {
            grantedPermissions.push(...access.permissions)
        })
    }
    var matchedPermission = grantedPermissions.filter((p) => {
        return (p.resourceType === requiredPermission.resourceType || p.resourceType === PermissionResourceType.ANY.toString())
            && (p.action === requiredPermission.action || p.resourceTarget === PERMISSIONACTION.ANY.toString())
            && (p.resourceTarget === requiredPermission.resourceTarget || p.resourceTarget === PermissionTargetType.ANY.toString())
    })
    if (!matchedPermission.length) {
        return false;
    }
    return !matchedPermission.some(p => p.effect == PermissionEffectType.DENY.toString())

}