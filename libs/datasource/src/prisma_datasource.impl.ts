import { BaseModel } from "@app/common/base.model";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { IDataSrouce } from "./datasource.interface";
import { User } from "apps/auth/src/auth/model/user.model";
import { QueryInfo } from "./query_helper";

@Injectable()
export class PrismaDataSource<T extends BaseModel> extends PrismaClient implements IDataSrouce<T>, OnModuleInit, OnModuleDestroy {
    static injectName = "PRISMA_DATA_SOURCE"
    async onModuleInit() {
        await this.$connect()
    }

    async create(data: T): Promise<T> {
        if (data instanceof User) {
            var result = await this.user.create({ data: { ...data as User } });
            return new User({ ...result }) as unknown as T;
        }
        else {
            throw Error("error occured")
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

    async findOne(query: T): Promise<T> {
        if (query instanceof User) {
            var result = await this.user.findFirst({ where: { ...query as User } });
            return new User({ ...result }) as unknown as T;
        }
        else {
            throw Error("error occured")
        }
    }
    async findMany(query: Object): Promise<T[]> {
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