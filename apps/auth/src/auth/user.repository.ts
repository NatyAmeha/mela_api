
import { DatasourceService, IDataSrouce, PrismaDataSource } from "@app/datasource";

import { User } from "./model/user.model";
import { Inject, Injectable } from "@nestjs/common";


export abstract class IUserRepository {
    abstract createUser(userInfo: User): Promise<User>
    abstract updateRefreshToken(userId: string, refreshToken: string): Promise<boolean>
}
@Injectable()
export class UserRepository extends PrismaDataSource<User> implements IUserRepository {
    static injectName = "USERREPOSITORY";
    async createUser(userInfo: User): Promise<User> {
        try {
            var userResult = await this.create(userInfo)
            return userResult;
        }
        catch (ex) {

        }
    }
    async updateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
        var updateResult = await this.update(userId, new User({ refreshToken: refreshToken }))
        return updateResult;
    }

}