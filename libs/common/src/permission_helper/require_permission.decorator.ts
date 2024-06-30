import { SetMetadata } from "@nestjs/common";
import { PermissionGuard } from "./permission.guard";
import { Permission } from "apps/auth/src/authorization/model/access.model";

export interface RequestedPermissionInfo extends Partial<Permission> {
    role?: string
}

export enum PermissionSelectionCriteria {
    ALL = "ALL",
    ANY = "ANY"

}

export interface PermissionConfiguration {
    permissions: RequestedPermissionInfo[],
    selectionCriteria?: PermissionSelectionCriteria,
}

export const RequiresPermission = (permissionConfig: PermissionConfiguration) => SetMetadata<symbol, PermissionConfiguration>(PermissionGuard.PERMISSION_CONFIGURATION, permissionConfig) 