import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationRepo, IAuthorizationRepo } from './data/authorization.repository';
import { Access, Permission } from './model/access.model';
import { Subscription } from 'apps/subscription/src/model/subscription.model';
import { Business } from 'apps/core/src/business/model/business.model';
import { BusinessPermission } from './utils/business_permissions';
import { AccessResponse } from './model/acces.response';

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

    async createDefaultBusinessOwnerAccess(access: Access) {

    }
}
