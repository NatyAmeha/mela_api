import { Global, Module } from '@nestjs/common';
import { BasePermissionHelper } from './permission_helper/permission_helper';
import { PermissionGuard } from './permission_helper/permission.guard';
import { ClassDecoratorValidator } from './validation_utils/class_decorator.validator';

@Global()
@Module({
  providers: [
    // { provide: BasePermissionHelper.InjectName, useClass: BasePermissionHelper },
    BasePermissionHelper,
    PermissionGuard,
    {
      provide: ClassDecoratorValidator.injectName,
      useClass: ClassDecoratorValidator,
    }
  ],
  exports: [
    // BasePermissionHelper.InjectName,
    BasePermissionHelper,
    PermissionGuard,
    ClassDecoratorValidator.injectName
  ],
})
export class CommonModule { }  
