import { Global, Module } from '@nestjs/common';
import { CoreController } from './core.controller';
import { CoreService } from './core.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../configuration';
import { RmqModule } from 'libs/rmq/rmq_module';
import { LoggerModule } from '@app/logger';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloFederationDriver } from '@nestjs/apollo';

import { CommonModule } from '@app/common';
import { CoreServiceMessageProcessor } from './msg_brocker_client/core_service_msg_processor';
import { CoreServiceMsgBrockerClient } from './msg_brocker_client/core_service_msg_brocker';
import { BusinessRepository } from './business/repo/business.repo';
import { AccessFactory } from '@app/common/permission_helper/access_factory.interface';
import { BusinessService } from './business/usecase/business.service';
import { BusinessResolver } from './business/resolver/business.resolver';
import { BranchRepository } from './branch/repo/branch.repository';
import { BranchService } from './branch/usecase/branch.service';
import { BranchResolver } from './branch/branch.resolver';
import { ProductRepository } from './product/repo/product.repository';
import { ProductResolver } from './product/product.resolver';
import { ProductService } from './product/product.service';
import { StaffRepository } from './staff/repo/staff.repo';
import { StaffResolver } from './staff/staff.resolver';
import { StaffService } from './staff/staff.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),
    RmqModule,
    CommonModule,
    LoggerModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloFederationDriver,
      useFactory: () => {
        return {
          autoSchemaFile: {
            federation: 2,
            path: './apps/core/schema.gql'
          },
          sortSchema: true,
          playground: true,
          context: ({ req }) => ({ headers: req.headers })
        }
      }
    }),
  ],

  providers: [
    { provide: CoreServiceMessageProcessor.InjectName, useClass: CoreServiceMessageProcessor },
    CoreService,

    { provide: BusinessRepository.injectName, useClass: BusinessRepository }, // This is the way to inject the repository
    { provide: AccessFactory.injectName, useClass: AccessFactory },
    BusinessService,
    BusinessResolver,

    { provide: BranchRepository.injectName, useClass: BranchRepository },
    BranchService,
    BranchResolver,

    { provide: ProductRepository.injectName, useClass: ProductRepository },
    ProductService, ProductResolver,

    { provide: StaffRepository.injectName, useClass: StaffRepository },
    StaffResolver, StaffService,

    { provide: CoreServiceMessageProcessor.InjectName, useClass: CoreServiceMessageProcessor },
    CoreServiceMsgBrockerClient,
  ],
  exports: []
})
export class CoreModule { } 
