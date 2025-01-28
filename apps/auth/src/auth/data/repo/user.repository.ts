import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

import { AccountType, FavoriteBusinessInfo, User } from "../../model/user.model";
import { IDatasource } from "@app/common/datasource_helper/datasource.interface";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaClient } from "apps/auth/prisma/generated/prisma_auth_client";
import { uniqBy, uniqWith } from "lodash";
import { PrismaException } from "@app/common/errors/prisma_exception";

export abstract class IUserRepository {
    abstract createUser(userInfo: User): Promise<User>
    abstract isUserRegisteredBefore(checkingField: Partial<User>): Promise<boolean>
    abstract getUserByOneOfFields(fields: Partial<User>[], accountType?: string): Promise<User | undefined>
    abstract getUser(query: Partial<User>): Promise<User | undefined>
    abstract updateUserInfo(userId: string, userInfo: Partial<User>): Promise<User>
    abstract addBusinessToFavorites(userId: string, businessInfos: FavoriteBusinessInfo[]): Promise<boolean>
    abstract removeBusinessFromFavorites(userId: string, businessIds: string[])
    abstract getStaffUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>
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

    async getUserByOneOfFields(fields: Partial<User>[], accountType?: string): Promise<User | undefined> {
        var result = await this.user.findFirst({ where: { OR: [...fields as any] } })
        if (!result) {
            return undefined
        }
        return new User({ ...result })
    }

    async createUser(userInfo: User): Promise<User> {
        const { accesses, ...restUserInfo } = userInfo;
        var userResult = await this.user.create({ data: { ...restUserInfo } });
        return new User({ ...userResult })
    }

    async getUser(userQuery: Partial<User>): Promise<User | undefined> {
        try {
            var userInfo = await this.user.findFirst({ where: { ...userQuery as any } })
            if (!userInfo) {
                return undefined
            }
            return new User({ ...userInfo });
        }
        catch (error) {
            if (error instanceof RequestValidationException) {
                throw error
            }
            console.log(error)
            throw new PrismaException({ message: error.message, statusCode: 500, exception: error })
        }
    }

    async updateUserInfo(userId: string, userInfo: Partial<User>): Promise<User> {
        try {
            const userResult = await this.user.update({ where: { id: userId }, data: { ...userInfo } })
            return new User({ ...userResult })

        } catch (error) {
            throw new PrismaException({ message: error.message, statusCode: 500, exception: error })
        }
    }

    async addBusinessToFavorites(userId: string, businessInfos: FavoriteBusinessInfo[]): Promise<boolean> {
        try {
            const user = await this.user.findUnique({ where: { id: userId } })
            if (!user) {
                throw new RequestValidationException({ message: "User not found" })
            }
            const allFavoriteBusinesses = [...user.favoriteBusinesses, ...businessInfos];
            const uniqFavoriteBusinesses = uniqBy(allFavoriteBusinesses, (fb) => fb.businessId)

            await this.user.update({
                where: { id: userId },
                data: {
                    favoriteBusinesses: uniqFavoriteBusinesses
                }
            })
            return true;
        }
        catch (ex) {
            throw new PrismaException({ message: ex.message, statusCode: 500, exception: ex })
        }
    }

    async removeBusinessFromFavorites(userId: string, businessIds: string[]): Promise<boolean> {
        try {
            const user = await this.user.findUnique({ where: { id: userId } })
            if (!user) {
                throw new RequestValidationException({ message: "User not found" })
            }
            const favoriteBusinesses = user.favoriteBusinesses.filter(fb => !businessIds.includes(fb.businessId))
            await this.user.update({
                where: { id: userId },
                data: {
                    favoriteBusinesses: favoriteBusinesses
                }
            })
            return true;
        }
        catch (ex) {
            throw new PrismaException({ message: ex.message, statusCode: 500, exception: ex })
        }
    }

    async getStaffUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
        try {
            const user = await this.user.findFirst({ where: { phoneNumber, OR: [{ accountType: AccountType.STAFF }, { accountType: AccountType.BUSINESS_OWNER }], } })
            return user ? new User({ ...user }) : undefined
        } catch (error) {
            console.log(error)
            throw new PrismaException({ message: error.message, statusCode: 500, exception: error })

        }
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}