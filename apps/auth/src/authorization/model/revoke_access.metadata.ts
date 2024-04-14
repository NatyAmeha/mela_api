import { AccessOwnerType } from "./access.model"
import { PermissionType } from "./permission_type.enum"

export class RevokeAccessMetadata {
    ownerId: string
    ownerType: AccessOwnerType
    permissionType: PermissionType

    constructor(data: Partial<RevokeAccessMetadata>) {
        Object.assign(this, data)
    }
}