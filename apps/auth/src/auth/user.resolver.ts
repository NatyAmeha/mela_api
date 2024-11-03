import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { FavoriteBusienssInput, FavoriteBusinessInfo, User } from "./model/user.model";
import { UseGuards } from "@nestjs/common";
import { JwtGuard } from "./service/guard/jwt.gurad";
import { CurrentUser } from "../../../../libs/common/get_user_decorator";
import { AuthService } from "./usecase/auth.service";
import { UpdateUserInput } from "./dto/update_user.input";
import { UserResponse } from "./dto/user.response";
import { UserService } from "./usecase/user.service";
import { AuthResponse } from "./model/auth.response";

@Resolver(of => UserResponse)
export class UserResolver {
    constructor(private readonly authService: AuthService, private userService: UserService) { }


    @UseGuards(JwtGuard)
    @Query(returns => UserResponse, { name: "me" })
    async getUserInfo(@CurrentUser() currentUser: User): Promise<UserResponse> {
        return new UserResponse({ user: currentUser })
    }


    @UseGuards(JwtGuard)
    @Mutation(returns => AuthResponse)
    async updateProfileInfo(@CurrentUser() currentUser: User, @Args("user") updateInput: UpdateUserInput): Promise<AuthResponse> {
        var userInfo = updateInput.getUserInfo();
        const result = await this.authService.updateUserInfo(currentUser.id!, userInfo);
        return result;
    }

    @UseGuards(JwtGuard)
    @Mutation(returns => UserResponse, { description: "Returns success boolean value to indicate if the operation was successful or not" })
    async addBusinessToFavorites(@CurrentUser() currentUser: User, @Args("input", { type: () => [FavoriteBusienssInput] }) input: FavoriteBusienssInput[]): Promise<UserResponse> {
        return await this.userService.addbusinesstoFavorite(currentUser.id!, input);
    }

    @UseGuards(JwtGuard)
    @Mutation(returns => UserResponse)
    async removeBusinessFromFavorites(@CurrentUser() currentUser: User, @Args("businessIds", { type: () => [String] }) businessIds: string[]): Promise<UserResponse> {
        return await this.userService.removeBusinessFromFavorites(currentUser.id!, businessIds);
    }

}