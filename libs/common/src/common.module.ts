import { Global, Module } from '@nestjs/common';
import { BasePermissionHelper } from './permission_helper/permission_helper';
import { PermissionGuard } from './permission_helper/permission.guard';
import { ClassDecoratorValidator } from './validation_utils/class_decorator.validator';
import { PrismaTransaction } from './datasource_helper/transaction_manager.interface';

@Global()
@Module({
  providers: [
    // { provide: BasePermissionHelper.InjectName, useClass: BasePermissionHelper },
    BasePermissionHelper,
    PermissionGuard,
    {
      provide: ClassDecoratorValidator.injectName,
      useClass: ClassDecoratorValidator,
    },
    PrismaTransaction,
  ],
  exports: [
    // BasePermissionHelper.InjectName,
    BasePermissionHelper,
    PermissionGuard,
    ClassDecoratorValidator.injectName,
    PrismaTransaction,
  ],
})
export class CommonModule { }  
