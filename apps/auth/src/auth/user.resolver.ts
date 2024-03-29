import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { User } from "./model/user.model";
import { UseGuards } from "@nestjs/common";
import { JwtGuard } from "./service/guard/jwt.gurad";
import { CurrentUser } from "./service/guard/get_user_decorator";
import { AuthService } from "./usecase/auth.service";
import { UpdateUserInput } from "./dto/update_user.input";
import { UserResponse } from "./dto/user.response";

@Resolver(of => UserResponse)
export class UserResolver {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(JwtGuard)
    @Query(returns => UserResponse, { name: "me" })
    async getUserInfo(@CurrentUser() currentUser: User): Promise<UserResponse> {
        // fetch user info based on their permission and role
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