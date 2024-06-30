import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Access, AccessOwnerType, Permission } from "./model/access.model";
import { CurrentUser } from "../../../../libs/common/get_user_decorator";
import { User } from "../auth/model/user.model";
import { CreateAccessInput } from "./dto/access.input";
import { AuthorizationService } from "./authorization.service";
import { boolean } from "joi";
import { ParseArrayPipe, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/service/guard/jwt.gurad";
import { CreatePermissionInput } from "./dto/permission.input";
import { AuthzGuard } from "libs/common/authorization.guard";
import { AccessResponse } from "./model/acces.response";
import { PermissionType } from "./model/permission_type.enum";
import { AccessQueryMetadata } from "./model/revoke_access.metadata";

@Resolver(of => [Access, AccessResponse])
export class AuthorizationResolver {

    constructor(private authorizationService: AuthorizationService) {

    }

    @UseGuards(JwtGuard)
    @Mutation(returns => [Permission])
    async addPermissionToUserAccess(@Args("user") userId: string, @Args("access") accessId: string, @Args({ name: "permissions", type: () => [CreatePermissionInput] }, new ParseArrayPipe({ items: CreatePermissionInput })) newPermissions: CreatePermissionInput[]): Promise<Permission[]> {
        var permissions = Permission.getPermissionFromPermissionInput(newPermissions)
        var permissionResult = await this.authorizationService.addPermission(userId, accessId, permissions)
        return permissionResult;
    }

    @UseGuards(JwtGuard)
    @Mutation(returns => Boolean)
    async removePermissionFromUserAccess(@Args("user") userId: string, @Args("access") accessId: string, @Args({ name: "permissions", type: () => [String] }) PermissionIds: string[]): Promise<boolean> {
        var removeAccessResult = await this.authorizationService.removePermission(userId, accessId, PermissionIds)
        return removeAccessResult;
    }

    @UseGuards(AuthzGuard)
    @Query(returns => AccessResponse)
    async getAccesses(@Args("ownerId") ownerId: string, @Args("owenrType", { type: () => AccessOwnerType }) ownerType: AccessOwnerType, @Args("permissionType", { type: () => PermissionType }) permissionType: PermissionType): Promise<AccessResponse> {
        let accessMetadata = new AccessQueryMetadata({ ownerId: ownerId, ownerType: ownerType, permissionType: permissionType });
        return await this.authorizationService.getAccesses(accessMetadata)
    }

} 