import { AuthInfo } from "../../dto/auth_info.args";
import { User } from "../../model/user.model";

export interface IAuthProvider {
    createAccount(userInfo: User): Promise<User>
    authenticate(authIinfo: AuthInfo): Promise<User>
}