import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationRepo, IAuthorizationRepo } from './data/authorization.repository';
import { Access, AccessOwnerType, Permission } from './model/access.model';
// import { Subscription } from 'apps/subscription/src/model/subscription.model';
import { Business } from 'apps/core/src/business/model/business.model';
import { BusinessPermission } from './utils/business_permissions';
import { AccessResponse } from './model/acces.response';
import { AccessQueryMetadata } from './model/revoke_access.metadata';
import { PermissionType } from './model/permission_type.enum';

@Injectable()
export class AuthorizationService {
    constructor(@Inject(AuthorizationRepo.injectName) private authorizationRepo: IAuthorizationRepo) {
    }
    async addPermission(userId: string, accessId: string, newPermissions: Permission[]): Promise<Permission[]> {
        let result = await this.authorizationRepo.addPermissionToAccess(accessId, newPermissions)
        return result;
    }

    async removePermission(userId: string, accessId: string, permissionIds: string[]): Promise<boolean> {
        let result = await this.authorizationRepo.removePermissionsFromAccess(accessId, permissionIds);
        return result;
    }

    async createAccess(accesses: Access[]): Promise<AccessResponse> {
        let result = await this.authorizationRepo.addPermissionAccess(accesses)
        return result;
    }

    async getAllUserAccesses(userId: string): Promise<Access[]> {
        let result = await this.authorizationRepo.getUserAllAccesses(userId);
        return result;
    }

    async getAllBusinessAccesses(businessId: string): Promise<Access[]> {
        let result = await this.authorizationRepo.getBusinessAllAccesses(businessId);
        return result;
    }

    async getAccesses(accessMetadata: AccessQueryMetadata): Promise<AccessResponse> {
        let result = await this.authorizationRepo.getAccesses(accessMetadata);
        return result;
    }

    async revokeAccesses(revokeAccessMetadata: AccessQueryMetadata): Promise<AccessResponse> {
        let result = await this.authorizationRepo.revokeAccessPermissions(revokeAccessMetadata);
        console.log("revoke access result count", result)
        return result;
    }


}
