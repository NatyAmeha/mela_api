import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { AuthInfo } from "../../dto/auth_info.args";
import { BaseAuthProvider, IAuthProvider } from "./Iauth_provider.interface";
import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, UserRepository } from "../../data/repo/user.repository";
import { AuthSecurityService, IAuthSecurityService } from "../auth_security.service";
import { User } from "../../model/user.model";

@Injectable()
export class EmailAuthProvider extends BaseAuthProvider {
    static injectName = "EMAIL_AUTH_PROVIDER"
    constructor(
        @Inject(UserRepository.injectName) public userRepo: IUserRepository,
        @Inject(AuthSecurityService.injectName) private authSecurity: IAuthSecurityService
    ) {
        super(userRepo)
    }
    async createAccount(userInfo: User): Promise<User> {
        if (!userInfo.email || !userInfo.password) {
            throw new RequestValidationException({ message: "Email is not provided", statusCode: 400 })
        }
        var isUserRegisteredBefore = await this.userRepo.isUserRegisteredBefore({ email: userInfo.email })
        if (isUserRegisteredBefore) {
            throw new RequestValidationException({ message: "User already exist", statusCode: 400 })
        }
        // hash password
        var hashedPassword = await this.authSecurity.hashPassword(userInfo.password);
        userInfo.password = hashedPassword;
        // create account to db 
        var userResult = await this.userRepo.createUser(userInfo)
        return userResult;
    }
    async authenticate(authInfo: AuthInfo): Promise<User> {
        if (!authInfo.email || !authInfo.password) {
            throw new RequestValidationException({ message: "Email or password not found", statusCode: 400 })
        }
        var userByEmail = await this.userRepo.getUser({ email: authInfo.email })
        if (userByEmail && userByEmail.password) {
            var hashedPassword = userByEmail.password;
            var isMatched = await this.authSecurity.verifyPassword(authInfo.password, hashedPassword);
            if (!isMatched) {
                throw new RequestValidationException({ message: "Password is incorrect", statusCode: 400 })
            }
            return userByEmail;
        }
        else {
            throw new RequestValidationException({ message: "email or password is incorrect", statusCode: 400 })
        }
    }

    async logout(userId: string): Promise<boolean> {
        return super.logout(userId);
    }

}