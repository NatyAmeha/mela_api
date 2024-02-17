import { AuthInfo } from "../../dto/auth_info.args";
import { User } from "../../model/user.model";

export interface IAuthProvider {
    createAccount(userInfo: User): Promise<User>
    authenticate(authInfo: AuthInfo): Promise<User>
}