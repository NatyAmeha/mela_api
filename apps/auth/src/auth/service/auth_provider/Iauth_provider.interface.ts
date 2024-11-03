import { Inject, Injectable } from "@nestjs/common";
import { AuthInfo } from "../../dto/auth_info.args";
import { User } from "../../model/user.model";
import { IUserRepository, UserRepository } from "../../data/repo/user.repository";

export interface IAuthProvider {
    createAccount(userInfo: User): Promise<User>
    authenticate(authInfo: AuthInfo): Promise<User>
    logout(userId: string): Promise<boolean>
}

export class BaseAuthProvider implements IAuthProvider {
    constructor(
        public userRepo: IUserRepository,
    ) {

    }
    createAccount(userInfo: User): Promise<User> {
        throw new Error("Method not implemented.");
    }
    authenticate(authInfo: AuthInfo): Promise<User> {
        throw new Error("Method not implemented.");
    }
    async logout(userId: string): Promise<boolean> {
        var updateTokenResult = await this.userRepo.updateUserInfo(userId, { refreshToken: null })
        return updateTokenResult.id ? true : false
    }

}