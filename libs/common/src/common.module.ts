import { Global, Module } from '@nestjs/common';
import { BasePermissionHelper } from './permission_helper/permission_helper';
import { PermissionGuard } from './permission_helper/permission.guard';

@Global()
@Module({
  providers: [
    // { provide: BasePermissionHelper.InjectName, useClass: BasePermissionHelper },
    BasePermissionHelper,
    PermissionGuard
  ],
  exports: [
    // BasePermissionHelper.InjectName,
    BasePermissionHelper,
    PermissionGuard
  ],
})
export class CommonModule { }  
