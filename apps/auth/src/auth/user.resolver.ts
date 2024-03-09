import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { User } from "./model/user.model";
import { UseGuards } from "@nestjs/common";
import { JwtGuard } from "./service/guard/jwt.gurad";
import { CurrentUser } from "./service/guard/get_user_decorator";
import { AuthService } from "./usecase/auth.service";
import { UpdateUserInput } from "./dto/update_user.input";
import { UserResponse } from "./dto/user.response";
import { PermissionGuard } from "@app/common/permission_helper/authorization.guard";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";

@Resolver(of => UserResponse)
export class UserResolver {
    constructor(private readonly authService: AuthService) { }

    // @RequiresPermission({ resourceType: "BUSINESS", action: "CREATE", resourceTarget: "ALL", effect: "ALLOW" })
    @UseGuards(JwtGuard)
    @Query(returns => UserResponse, { name: "me" })
    async getUserInfo(@CurrentUser() currentUser: User): Promise<UserResponse> {
        return {
            user: currentUser
        }
    }

    @UseGuards(JwtGuard)
    @Mutation(returns => Boolean)
    async updateProfileInfo(@CurrentUser() currentUser: User, @Args("user") updateInput: UpdateUserInput): Promise<boolean> {
        var userInfo = updateInput.getUserInfo();
        var isUpdated = await this.authService.updateUserInfo(currentUser.id!, userInfo);
        return isUpdated;
    }

}