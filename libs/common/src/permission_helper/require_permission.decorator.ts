import { SetMetadata } from "@nestjs/common";
import { PermissionGuard } from "./permission.guard";
import { Permission } from "apps/auth/src/authorization/model/access.model";

export const RequiresPermission = (permission: Partial<Permission>) => SetMetadata<symbol, Partial<Permission>>(PermissionGuard.REQUIRED_PERMISSION, permission)