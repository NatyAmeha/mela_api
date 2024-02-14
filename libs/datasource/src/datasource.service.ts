import { Injectable } from '@nestjs/common';
import { PrismaDataSource } from './prisma_datasource.impl';
import { User } from 'apps/auth/src/auth/model/user.model';

@Injectable()
export class DatasourceService {
    constructor(private userRepo: PrismaDataSource<User>) { }

}
