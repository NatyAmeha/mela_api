import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { User } from "../../model/user.model";
import { AuthServicePrismaDataSource } from "../datasource/auth_service_prisma_datasource.impl";
import { IDatasource } from "@app/common/datasource_helper/datasource.interface";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";

export abstract class IUserRepository {
    abstract createUser(userInfo: User): Promise<User>
    abstract isUserRegisteredBefore(email?: string, phone?: string): Promise<boolean>
    abstract updateRefreshToken(userId: string, refreshToken: string): Promise<boolean>
}
@Injectable()
export class UserRepository implements IUserRepository {
    static injectName = "USERREPOSITORY";

    constructor(@Inject(AuthServicePrismaDataSource.injectName) private datasource: IDatasource<User>) {
    }

    async isUserRegisteredBefore(email?: string, phone?: string): Promise<boolean> {
        var queryInfo: QueryHelper<User> = {
            query: new User({ email, phoneNumber: phone }),
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