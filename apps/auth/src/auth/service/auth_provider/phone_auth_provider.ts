import { Inject } from "@nestjs/common";
import { AuthInfo } from "../../dto/auth_info.args";
import { User } from "../../model/user.model";
import { IAuthProvider } from "./Iauth_provider.interface";
import { IUserRepository, UserRepository } from "../../data/repo/user.repository";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { ErrorTypes } from "@app/common/errors/error_types";

export class PhoneAuthProvder implements IAuthProvider {
    static injectName = "PHONE_AUTH_PROVIDER"
    constructor(
        @Inject(UserRepository.injectName) private userRepo: IUserRepository,
    ) {

    }
    async createAccount(userInfo: User): Promise<User> {
        if (!userInfo.phoneNumber) {
            throw new RequestValidationException({ message: "Phone number is not provided", statusCode: 400 })
        }
        var isUserRegisteredBefore = await this.userRepo.isUserRegisteredBefore({ phoneNumber: userInfo.phoneNumber })
        if (isUserRegisteredBefore) {
            throw new RequestValidationException({ message: "User already exist", statusCode: 400, errorType: ErrorTypes.USER_ALREADY_EXIST })
        }
        // create account to db
        var userResult = await this.userRepo.createUser(userInfo)
        return userResult;
    }
    async authenticate(authInfo: AuthInfo): Promise<User> {
        if (!authInfo.phoneNumber) {
            throw new RequestValidationException({ message: "Phone number is not provided", statusCode: 400 })
        }
        var userByPhoneNumber = await this.userRepo.getUserByPhoneNumber(authInfo.phoneNumber)
        if (!userByPhoneNumber) {
            throw new RequestValidationException({ message: "User not foud by this phone number", statusCode: 400, errorType: ErrorTypes.USER_NOT_FOUND })
        }
        return userByPhoneNumber;
    }

}