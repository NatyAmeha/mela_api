import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { User } from "../../model/user.model";
import { IDatasource } from "@app/common/datasource_helper/datasource.interface";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaClient } from "apps/auth/prisma/generated/prisma_auth_client";
import { Access } from "apps/auth/src/authorization/model/access.model";

export abstract class IUserRepository {
    abstract createUser(userInfo: User): Promise<User>
    abstract isUserRegisteredBefore(checkingField: Partial<User>): Promise<boolean>
    abstract getUser(query: Partial<User>): Promise<User | undefined>
    abstract updateUserInfo(userId: string, userInfo: Partial<User>): Promise<boolean>
}
@Injectable()
export class UserRepository extends PrismaClient implements IUserRepository, OnModuleInit, OnModuleDestroy {

    static injectName = "USERREPOSITORY";

    async onModuleInit() {
        await this.$connect();
    }

    async isUserRegisteredBefore(checkingField: Partial<User>): Promise<boolean> {

        var result = await this.user.findFirst({ where: { ...checkingField as any } })
        return result?.id != undefined;
    }
    async createUser(userInfo: User): Promise<User> {
        var userResult = await this.user.create({ data: { ...userInfo, accesses: {} } });
        return new User({ ...userResult })
    }

    async getUser(userQuery: Partial<User>): Promise<User | undefined> {
        var userInfo = await this.user.findFirst({ where: { ...userQuery as any }, include: { accesses: true } })
        if (!userInfo.id) {
            throw new RequestValidationException({ message: "Incorrect query data provided" })
        }
        return new User({ ...userInfo });
    }

    async updateUserInfo(userId: string, userInfo: Partial<User>): Promise<boolean> {
        await this.user.update({ where: { id: userId }, data: { ...userInfo, accesses: {} } })
        return true;
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}