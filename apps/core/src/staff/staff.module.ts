import { Module } from '@nestjs/common';
import { BusinessModule } from '../business/business.module';
import { StaffService } from './staff.service';
import { BranchModule } from '../branch/branch.module';
import { StaffResolver } from './staff.resolver';
import { StaffRepository } from './repo/staff.repo';

@Module({
    imports: [BusinessModule, BranchModule],
    providers: [
        { provide: StaffRepository.injectName, useClass: StaffRepository },
        StaffResolver, StaffService
    ],
    exports: [StaffService, StaffRepository.injectName, StaffResolver]
})
export class StaffModule { }