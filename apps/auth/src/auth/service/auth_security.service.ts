import { SecurityException } from '@app/common/errors/security_exception';
import { Injectable } from '@nestjs/common';

export interface IAuthSecurityService {
    hashPassword(password: string): Promise<string>
    verifyPassword(password: string, hashedPasswrod: string): Promise<boolean>
}

@Injectable()
export class AuthSecurityService implements IAuthSecurityService {
    static injectName = "AUTH_SECURITY_SERVICE";
    async hashPassword(password: string): Promise<string> {
        try {
            // var hashedPassword = await argon2.hash(password)
            return password;
        } catch (error) {
            var exception = new SecurityException({ message: "Error occured while hashing password", exception: error });
            throw exception;
        }
    }
    async verifyPassword(password: string, hashedPasswrod: string): Promise<boolean> {
        try {
            // var isMatched = await argon2.verify(hashedPasswrod, password)
            return true;
        } catch (error) {
            var exception = new SecurityException({ message: "Error occured while verifying password", exception: error });
            throw exception;
        }
    }

}