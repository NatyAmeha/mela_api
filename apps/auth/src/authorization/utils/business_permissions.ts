import { Business } from "apps/core/src/business/model/business.model"
import { Access, AccessOwnerType, DefaultRoles, Permission } from "../model/access.model"
import { PermissionEffectType } from "@app/common/permission_helper/permission_constants"
import { AppResources } from "apps/mela_api/src/const/app_resource.constant"
// import { PlatformService } from "apps/subscription/src/model/platform_service.model"

export interface IPermissionGenerator<T> {
    generateDefaultPermissions(businessInfo: T): Promise<Access[]>
}


export class BusinessPermission implements IPermissionGenerator<Business> {
    static InjectName = 'BusinessPermission'
    async generateDefaultPermissions(businessInfo: Business): Promise<Access[]> {
        var accessResult: Access[] = []
        var businessAccessPermission = new Permission({ resourceType: AppResources.BUSINESS, resourceTarget: businessInfo.id })
        var managePlatformServicePermission = new Permission({ resourceType: AppResources.PLATFORM_SERVICES, resourceTarget: businessInfo.id, effect: PermissionEffectType.ALLOW })
        var access = new Access({ permissions: [businessAccessPermission, managePlatformServicePermission], role: DefaultRoles.BUSINESS_OWNER, owner: businessInfo.creator, ownerType: AccessOwnerType.BUSINESS })
        accessResult.push(access)
        return accessResult;
    }
}