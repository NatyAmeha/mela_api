import { Module, forwardRef } from '@nestjs/common';
import { BusinessResolver } from './resolver/business.resolver';
import { BusinessService } from './usecase/business.service';
import { BusinessRepository } from './repo/business.repo';
import { ProductModule } from '../product/product.module';
import { BranchModule } from '../branch/branch.module';
import { CoreServiceMsgBrockerClient } from '../core_service_msg_brocker';
import { RmqModule } from 'libs/rmq/rmq_module';
import { BusinessAccessGenerator } from './business_access_factory';
import { AccessFactory } from '../access_factory.interface';


@Module({
    imports: [
        forwardRef(() => BranchModule), forwardRef(() => ProductModule),
        RmqModule,
    ],
    providers: [
        { provide: BusinessRepository.injectName, useClass: BusinessRepository }, // This is the way to inject the repository
        { provide: AccessFactory.injectName, useClass: AccessFactory },
        BusinessService,
        BusinessResolver,
        CoreServiceMsgBrockerClient
    ],
    exports: [
        BusinessRepository.injectName,
        BusinessResolver,
        BusinessService,
    ]
})
export class BusinessModule { }