import { QueryHelper } from "./query_helper"

export interface IDatasource<T> {
    create(data: T): Promise<T>
    createMany(data: T[]): Promise<T[]>
    getById(id: String): Promise<T>
    getAll(): Promise<T[]>
    findOne(query: QueryHelper<T>): Promise<T>
    findMany(query: QueryHelper<T>): Promise<T[]>
    update(id: string, data: T): Promise<boolean>
    updateMany(id: String[], data: T[]): Promise<boolean>
    deleteOne(id: String): Promise<boolean>
    deleteMany(id: String[]): Promise<boolean>
}