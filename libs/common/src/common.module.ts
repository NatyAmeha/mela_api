import { Global, Module } from '@nestjs/common';
import { BasePermissionHelper } from './permission_helper/permission_helper';

@Global()
@Module({
  providers: [
    { provide: BasePermissionHelper.InjectName, useClass: BasePermissionHelper },
    BasePermissionHelper,
  ],
  exports: [
    BasePermissionHelper.InjectName,
    BasePermissionHelper
  ],
})
export class CommonModule { } 
