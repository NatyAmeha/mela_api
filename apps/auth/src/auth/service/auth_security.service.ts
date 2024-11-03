import { SecurityException } from '@app/common/errors/security_exception';
import { Injectable } from '@nestjs/common';
import * as argon2 from "argon2";

export interface IAuthSecurityService {
    hashPassword(password: string): Promise<string>
    verifyPassword(password: string, hashedPasswrod: string): Promise<boolean>
}

@Injectable()
export class AuthSecurityService implements IAuthSecurityService {
    static injectName = "AUTH_SECURITY_SERVICE";
    async hashPassword(password: string): Promise<string> {
        try {
            var hashedPassword = await argon2.hash(password)
            return hashedPassword;
        } catch (error) {
            var exception = new SecurityException({ message: "Error occured while hashing password", exception: error });
            throw exception;
        }
    }
    async verifyPassword(password: string, hashedPasswrod: string): Promise<boolean> {
        try {
            var isMatched = await argon2.verify(hashedPasswrod, password)
            return isMatched;
        } catch (error) {
            var exception = new SecurityException({ message: "Error occured while verifying password", exception: error });
            throw exception;
        }
    }

}