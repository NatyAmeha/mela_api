import { Module } from '@nestjs/common';
import { DatasourceService } from './datasource.service';
import { PrismaDataSource } from './prisma_datasource.impl';
import { User } from 'apps/auth/src/auth/model/user.model';


@Module({
  providers: [DatasourceService,
    // { provide: PrismaDataSource.injectName, useClass: PrismaDataSource, },
    PrismaDataSource
  ],
  exports: [DatasourceService, PrismaDataSource],
})
export class DatasourceModule { }
