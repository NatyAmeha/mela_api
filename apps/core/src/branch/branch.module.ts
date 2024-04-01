import { Module, forwardRef } from '@nestjs/common';
import { BranchService } from './usecase/branch.service';
import { BranchRepository } from './repo/branch.repository';
import { BranchResolver } from './branch.resolver';
import { BusinessModule } from '../business/business.module';
import { ProductModule } from '../product/product.module';

@Module({
    imports: [
        forwardRef(() => BusinessModule), forwardRef(() => ProductModule)
    ],
    providers: [
        { provide: BranchRepository.injectName, useClass: BranchRepository },
        BranchService,
        BranchResolver
    ],
    exports: [
        BranchRepository.injectName,
        BranchService,
        BranchResolver,

    ]
})
export class BranchModule { }