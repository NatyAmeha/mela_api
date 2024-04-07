import { Global, Module } from '@nestjs/common';
import { BasePermissionHelper } from './permission_helper/permission_helper';

@Global()
@Module({
  providers: [
    { provide: BasePermissionHelper.injectName, useClass: BasePermissionHelper }
  ],
  exports: [
    BasePermissionHelper.injectName
  ],
})
export class CommonModule { }
