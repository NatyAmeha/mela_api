import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Access, Permission } from "./model/access.model";
import { CurrentUser } from "../auth/service/guard/get_user_decorator";
import { User } from "../auth/model/user.model";
import { CreateAccessInput } from "./dto/access.input";
import { AuthorizationService } from "./authorization.service";
import { boolean } from "joi";
import { ParseArrayPipe, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/service/guard/jwt.gurad";
import { AccessArgs } from "./dto/access.args";
import { CreatePermissionInput } from "./dto/permission.input";
// import { CreatePermissionInput } from "./dto/permission.input";

@Resolver(of => Access)
export class AuthorizationResolver {

    constructor(private authorizationService: AuthorizationService) {

    }
    @UseGuards(JwtGuard)
    @Mutation(returns => [Access])
    async addAuthorizationAccess(@Args("user") userId: string, @Args({ name: "accesses", type: () => [CreateAccessInput] }, new ParseArrayPipe({ items: CreateAccessInput })) accesses: CreateAccessInput[]): Promise<Access[]> {
        var accessList = Access.getAccessInfoFromAccessInput(accesses)
        var result = await this.authorizationService.creatNewAccessForUser(userId, accessList)
        return result;
    }

    @UseGuards(JwtGuard)
    @Mutation(returns => Boolean)
    async removeAccessFromUser(@Args("info") info: AccessArgs): Promise<boolean> {
        var removeAccessResult = await this.authorizationService.removeAccessFromUser(info.user, info.accesses)
        return removeAccessResult;
    }

    @UseGuards(JwtGuard)
    @Mutation(returns => [Permission])
    async addPermissionToUserAccess(@Args("info") info: AccessArgs, @Args({ name: "permissions", type: () => [CreatePermissionInput] }) newPermissions: CreatePermissionInput[]): Promise<Permission[]> {
        var permissions = Permission.getPermissionFromPermissionInput(newPermissions)
        var permissionResult = await this.authorizationService.addPermission(info.user, info.access, permissions)
        return permissionResult;
    }

    @UseGuards(JwtGuard)
    @Mutation(returns => Boolean)
    async removePermissionFromUserAccess(@Args("info") info: AccessArgs): Promise<boolean> {
        var removeAccessResult = await this.authorizationService.removePermission(info.user, info.access, info.permissions)
        return removeAccessResult;
    }

} 