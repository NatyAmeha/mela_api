import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Access, Permission } from "./model/access.model";
import { CurrentUser } from "../auth/service/guard/get_user_decorator";
import { User } from "../auth/model/user.model";
import { CreateAccessInput } from "./dto/access.input";
import { AuthorizationService } from "./authorization.service";
import { boolean } from "joi";
import { ParseArrayPipe, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/service/guard/jwt.gurad";
import { CreatePermissionInput } from "./dto/permission.input";

@Resolver(of => Access)
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

} 