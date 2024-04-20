import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { Business } from "./model/business.model";
import { Access, AccessOwnerType, AppResources, DefaultRoles, Permission } from "apps/auth/src/authorization/model/access.model";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { IAccessGenerator } from "@app/common/permission_helper/access_factory.interface";


export class BusinessAccessGenerator implements IAccessGenerator<Business> {
    static injectName = "BusinessAccessFacotry";
    async createAccess(businessInfo: Business, role?: string,): Promise<Access[]> {
        var accessList: Access[] = []
        switch (role) {
            case DefaultRoles.BUSINESS_OWNER:
                let businessOwnershipAccess = new Access({
                    role: DefaultRoles.BUSINESS_OWNER,
                    owner: businessInfo.creator,
                    ownerType: AccessOwnerType.USER,
                    permissionType: PermissionType.BUSINESS_MANAGEMENT_PERMISSION,
                    permissions: [
                        new Permission({ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourceTarget: businessInfo.id }),
                        // deprecated
                        // new Permission({ resourceType: AppResources.PLATFORM_SERVICE_SUBSCRIPTION, action: PERMISSIONACTION.ANY, resourceTarget: businessInfo.id }),
                        // new Permission({ resourceType: AppResources.PLATFORM_SERVICES, action: PERMISSIONACTION.ANY, resourceTarget: businessInfo.id }),
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