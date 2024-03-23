import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { BranchModule } from '../branch/branch.module';
import { BusinessModule } from '../business/business.module';
import { ProductRepository } from './repo/product.repository';
import { ProductResolver } from './product.resolver';


@Module({
    imports: [BranchModule, BusinessModule],
    providers: [
        { provide: ProductRepository.injectName, useClass: ProductRepository },
        ProductService, ProductResolver
    ],
})
export class ProductModule { }