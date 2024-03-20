import { registerEnumType } from "@nestjs/graphql";

export enum PermissionType {
    PLATFORM_PERMISSION = "PLATFORM_PERMISSION",
    PLATFORM_SERVICE_CUSTOMIZATION_PERMISSION = "PLATFORM_SERVICE_CUSTOMIZATION_PERMISSION"
}

registerEnumType(PermissionType, { name: "PermissionType" })