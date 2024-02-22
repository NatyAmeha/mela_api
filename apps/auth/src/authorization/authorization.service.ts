import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationRepo, IAuthorizationRepo } from './data/authorization.repository';
import { Access, Permission } from './model/access.model';

@Injectable()
export class AuthorizationService {
    constructor(@Inject(AuthorizationRepo.injectName) private authorizationRepo: IAuthorizationRepo) {
    }

    async creatNewAccessForUser(userId: string, newAccesses: Access[]): Promise<Access[]> {
        var result = await this.authorizationRepo.addAccessToUser(userId, newAccesses)
        return result;
    }

    async removeAccessFromUser(userId: string, accessIds: string[]): Promise<boolean> {
        var result = await this.authorizationRepo.removeAccessFromUser(userId, accessIds)
        return result;
    }

    async addPermission(userId: string, accessId: string, newPermissions: Permission[]): Promise<Permission[]> {
        var result = await this.authorizationRepo.addPermissionToAccess(userId, accessId, newPermissions)
        return result;
    }

    async removePermission(userId: string, accessId: string, permissionIds: string[]): Promise<boolean> {
        var result = await this.authorizationRepo.removePermissionsFromAccess(userId, accessId, permissionIds);
        return result;
    }
}
