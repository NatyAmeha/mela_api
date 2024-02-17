import { BaseModel } from "@app/common/base.model";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { User } from "apps/auth/src/auth/model/user.model";
import { DbException } from "@app/common/errors/db_exception";
import { IDatasource } from "@app/common/datasource_helper/datasource.interface";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

@Injectable()
// pass The T type with class instance (Eg, new User({})) not js object literal
export class AuthServicePrismaDataSource<T extends BaseModel> extends PrismaClient implements IDatasource<T>, OnModuleInit, OnModuleDestroy {
    static injectName = "AUTH_SERVICE_PRISMA_DATA_SOURCE"
    async onModuleInit() {
        await this.$connect()
    }

    async create(data: T): Promise<T> {
        try {
            if (data instanceof User) {
                var result = await this.user.create({ data: { ...data as User } });
                return new User({ ...result }) as unknown as T;
            }
            else {
                throw new DbException({ message: "data type is incorrect to save to db" })
            }
        } catch (ex) {
            throw new DbException({ message: `Error occured while saving to db`, exception: ex })
        }
    }
    createMany(data: T[]): Promise<T[]> {
        throw new Error("Method not implemented.")
    }
    getById(id: String): Promise<T> {
        throw new Error("Method not implemented.")
    }
    getAll(): Promise<T[]> {
        throw new Error("Method not implemented.")
    }

    async findOne(queryHelper: QueryHelper<T>): Promise<T | null> {
        if (queryHelper.query instanceof User) {
            var userResult = await this.user.findFirst({ where: { ...queryHelper.query as User } });
            if (!userResult?.id) {
                return Promise.resolve(null)
            }
            return new User({ ...userResult }) as unknown as T;
        }
        else {
            throw new RequestValidationException({ message: "Incorrect query data provided" })
        }
    }
    async findMany(query: QueryHelper<T>): Promise<T[]> {
        // if (query instanceof User) {
        //     var result = await this.user.findMany({ where: { ...query as User }, orderBy : {email : } });
        //     return new User({ ...result }) as unknown as T;
        // }
        // else {
        //     throw Error("error occured")
        // }
        throw Error();
    }
    async update(id: string, data: T): Promise<boolean> {
        if (data instanceof User) {
            var userUpdateResult = await this.user.update({ where: { id: id }, data: { ...data } })
            return true;
        }
        else {
            return false;
        }
    }
    updateMany(id: String[], data: T[]): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    deleteOne(id: String): Promise<boolean> {
        throw new Error("Method not implemented.")
    }
    deleteMany(id: String[]): Promise<boolean> {
        throw new Error("Method not implemented.")
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }



}