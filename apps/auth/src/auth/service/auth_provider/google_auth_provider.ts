import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { AuthInfo } from "../../dto/auth_info.args";
import { BaseAuthProvider, IAuthProvider } from "./Iauth_provider.interface";
import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, UserRepository } from "../../data/repo/user.repository";
import { User } from "../../model/user.model";

@Injectable()
export class GoogleAuthProvider extends BaseAuthProvider {
    static injectName = "GOOGLE_AUTH_PROVIDER"
    constructor(
        @Inject(UserRepository.injectName) public userRepo: IUserRepository,
    ) {
        super(userRepo)
    }
    async createAccount(userInfo: User): Promise<User> {
        if (!userInfo.googleId || !userInfo.phoneNumber) {
            throw new RequestValidationException({ message: "Phone number and google id are required", statusCode: 400 })
        }
        var isUserRegisteredBefore = await this.userRepo.isUserRegisteredBefore({ googleId: userInfo.googleId })
        console.log("isUserRegisteredBefore", isUserRegisteredBefore, userInfo)
        if (isUserRegisteredBefore) {
            const userResult = await this.userRepo.getUser({ googleId: userInfo.googleId })
            return userResult;
        }
        // check user by phone number or email
        const result = await this.userRepo.getUserByOneOfFields([{ phoneNumber: userInfo.phoneNumber }, { email: userInfo.email }], userInfo.accountType)
        if (result) {
            const updatedUser = await this.userRepo.updateUserInfo(result.id, { googleId: userInfo.googleId })
            return updatedUser;
        }
        // create account to db
        var userResult = await this.userRepo.createUser(userInfo)
        return userResult;
    }
    async authenticate(authInfo: AuthInfo): Promise<User> {
        if (!authInfo.googleId) {
            throw new RequestValidationException({ message: "Google id not found", statusCode: 400 })
        }
        var userResult = await this.userRepo.getUser({ googleId: authInfo.googleId })
        return userResult;
    }

    async logout(userId: string): Promise<boolean> {
        return super.logout(userId);
    }

}