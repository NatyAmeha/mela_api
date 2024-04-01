import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { AuthorizationRepo } from './data/authorization.repository';
import { AuthorizationResolver } from './authorization.resolver';

@Module({
  providers: [AuthorizationService,
    {
      provide: AuthorizationRepo.injectName,
      useClass: AuthorizationRepo
    },
    AuthorizationResolver],
  exports: [
    AuthorizationService, AuthorizationResolver

  ],
})
export class AuthorizationModule { }
