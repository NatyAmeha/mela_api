import { BaseModel } from "@app/common/base.model";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { IDataSrouce } from "../../../../../../libs/datasource/src/datasource.interface";
import { User } from "apps/auth/src/auth/model/user.model";
import { QueryInfo } from "../../../../../../libs/datasource/src/query_helper";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { DbException } from "@app/common/errors/db_exception";

@Injectable()
// pass The T type with class instance (Eg, new User({})) not js object literal
export class AuthServicePrismaDataSource<T extends BaseModel> extends PrismaClient implements IDataSrouce<T>, OnModuleInit, OnModuleDestroy {
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
            throw new DbException(ex)
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

    async findOne(query: QueryInfo<T>): Promise<T> {
        if (query.query instanceof User) {
            var userResult = await this.user.findFirst({ where: { email: (query.query as User).email } });
            if (userResult) {

            }
            return new User({ ...userResult }) as unknown as T;
        }
        else {
            throw Error("error occured")
        }
    }
    async findMany(query: QueryInfo<T>): Promise<T[]> {
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