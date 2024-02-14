import { BaseModel } from "@app/common/base.model"
import { Injectable, OnModuleInit } from "@nestjs/common"
import { PrismaClient } from "@prisma/client"
import { User } from "apps/auth/src/auth/model/user.model"
import { QueryInfo } from "./query_helper"

@Injectable()
export abstract class IDataSrouce<T extends BaseModel> {
    abstract create(data: T): Promise<T>
    abstract createMany(data: T[]): Promise<T[]>
    abstract getById(id: String): Promise<T>
    abstract findOne(query: Object): Promise<T>
    abstract findMany(query: Object): Promise<T[]>
    abstract getAll(): Promise<T[]>
    abstract update(id: string, data: T): Promise<boolean>
    abstract updateMany(id: String[], data: T[]): Promise<boolean>
    abstract deleteOne(id: String): Promise<boolean>
    abstract deleteMany(id: String[]): Promise<boolean>
}
