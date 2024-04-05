import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { IAccessFactory, IAccessGenerator } from "../access_factory.interface";
import { Business } from "./model/business.model";
import { Access, AccessOwnerType, AppResources, DefaultRoles, Permission } from "apps/auth/src/authorization/model/access.model";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";


export class BusinessAccessGenerator implements IAccessGenerator<Business> {
    static injectName = "BusinessAccessFacotry";
    async createDefaultAccess(businessInfo: Business, role?: string): Promise<Access[]> {
        var accessList: Access[] = []
        switch (role) {
            case DefaultRoles.BUSINESS_OWNER:
                let businessOwnershipAccess = new Access({
                    role: DefaultRoles.BUSINESS_OWNER,
                    owner: businessInfo.creator,
                    ownerType: AccessOwnerType.USER,
                    permissionType: PermissionType.PLATFORM_PERMISSION,
                    permissions: [
                        new Permission({ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourceTarget: businessInfo.id }),
                    ]
                })
                accessList.push(businessOwnershipAccess)
                break;
            default:
                break;
        }
        return accessList;
    }
}