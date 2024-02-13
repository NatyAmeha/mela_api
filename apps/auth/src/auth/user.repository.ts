import { IDataSrouce } from "@app/datasource/datasource.interface";
import { User } from "./model/user.model";
import { Injectable } from "@nestjs/common";
import { PrismaDataSource } from "@app/datasource/prisma_datasource.impl";

export abstract class IUserRepository extends IDataSrouce<User> {

}

@Injectable()
export class UserRepository extends PrismaDataSource<User> implements IUserRepository {

}