import { Access, AccessOwnerType } from "./access.model"
import { PermissionType } from "./permission_type.enum"

export class AccessQueryMetadata {
    ownerId: string
    ownerType: AccessOwnerType
    permissionType: PermissionType

    constructor(data: Partial<AccessQueryMetadata>) {
        Object.assign(this, data)
    }
}

export interface AccessRenewalInfo {
    newAccesses: Access[]
    revokeAccessCommand: AccessQueryMetadata
}