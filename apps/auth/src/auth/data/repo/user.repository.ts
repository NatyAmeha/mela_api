
import { DatasourceService, IDataSrouce, AuthServicePrismaDataSource, QueryInfo } from "@app/datasource";

import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { User } from "../../model/user.model";

export abstract class IUserRepository {
    abstract createUser(userInfo: User): Promise<User>
    abstract isUserRegisteredBefore(email?: string, phone?: string): Promise<boolean>
    abstract updateRefreshToken(userId: string, refreshToken: string): Promise<boolean>
}
@Injectable()
export class UserRepository implements IUserRepository {
    static injectName = "USERREPOSITORY";

    constructor(@Inject(AuthServicePrismaDataSource.injectName) private datasource: IDataSrouce<User>) {
    }

    async isUserRegisteredBefore(email?: string, phone?: string): Promise<boolean> {
        var queryInfo: QueryInfo<User> = {
            query: new User({ email, phoneNumber: phone }),
            unique: true,
        }
        var result = await this.datasource.findOne(queryInfo)
        return result.email != undefined;
    }
    async createUser(userInfo: User): Promise<User> {
        var userResult = await this.datasource.create(userInfo);
        return userResult as User;
    }
    async updateRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
        var updateResult = await this.datasource.update(userId, new User({ refreshToken: refreshToken }))
        return updateResult;
    }

}