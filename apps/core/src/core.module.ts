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
import { BusinessAccessGenerator } from './business/business_access_factory';
import { ProductResourceUsageTracker } from './resource_usage_tracker/product_resource_usage';
import { BranchResourceUsageTracker } from './resource_usage_tracker/branch_resource_usage_tracker';
import { InventoryLocationRepository } from './inventory/repo/inventory_location.repository';
import { InventoryRepository } from './inventory/repo/inventory.repository';
import { InventoryLocationResolver } from './inventory/inventroy_location.resolver';
import { InventoryService } from './inventory/inventory.service';
import { BusinessResponseBuilder } from './business/model/business.response';
import { InventoryLocationBuilder } from './inventory/model/inventory_location.model';


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
    { provide: BusinessAccessGenerator.injectName, useClass: BusinessAccessGenerator },
    BusinessService,
    BusinessResolver,

    { provide: BranchRepository.injectName, useClass: BranchRepository },
    { provide: BranchResourceUsageTracker.injectName, useClass: BranchResourceUsageTracker },
    BranchService,
    BranchResolver,

    { provide: ProductRepository.injectName, useClass: ProductRepository },
    { provide: ProductResourceUsageTracker.injectName, useClass: ProductResourceUsageTracker },
    ProductService, ProductResolver,

    { provide: StaffRepository.injectName, useClass: StaffRepository },
    StaffResolver, StaffService,

    { provide: InventoryLocationRepository.injectName, useClass: InventoryLocationRepository },
    { provide: InventoryRepository.injectName, useClass: InventoryRepository },
    InventoryLocationResolver, InventoryService,

    { provide: CoreServiceMessageProcessor.InjectName, useClass: CoreServiceMessageProcessor },
    CoreServiceMsgBrockerClient,

    // Builders and utils
    BusinessResponseBuilder, InventoryLocationBuilder
  ],
  exports: []
})
export class CoreModule { } 
