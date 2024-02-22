import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './usecase/auth.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { CommonModule } from '@app/common';
import { UserRepository } from './data/repo/user.repository';
import { LoggerModule } from '@app/logger';
import { configuration } from 'apps/auth/configuration';
import { AccessTokenStretegy } from './service/guard/jwt.service';
import { RefreshTokenStrategy } from './service/guard/jwt_refresh.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthSecurityService } from './service/auth_security.service';
import { AppException } from '@app/common/errors/app_exception.model';
import { EmailAuthProvider } from './service/auth_provider/email_auth_provider';
import { PhoneAuthProvder } from './service/auth_provider/phone_auth_provider';
import { UserResolver } from './user.resolver';
import { AuthorizationModule } from '../authorization';



@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
      // envFilePath: ["../.env.dev"],
      // validationSchema: Joi.object({
      //   "NODE_ENV" : Joi.string().valid("development", "production").default("development")
      // })
    }),
    JwtModule.register({}),
    LoggerModule,
    AuthorizationModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => {
        return {
          autoSchemaFile: './apps/auth/schema.gql',
          sortSchema: true,
          playground: true,
          // formatError: (error) => {
          //   const originalError = error.extensions
          //     ?.originalError as AppException;

          //   if (!originalError) {
          //     return {
          //       message: error.message,
          //       code: error.extensions?.code,
          //     };
          //   }
          //   return {
          //     message: originalError.message,
          //     code: error.extensions?.code,
          //   };
          // },
          context: ({ req }) => ({ headers: req.headers })
        }
      }
    })
  ],
  controllers: [],
  providers: [
    {
      provide: UserRepository.injectName,
      useClass: UserRepository
    },
    {
      provide: AuthSecurityService.injectName,
      useClass: AuthSecurityService,
    },
    {
      provide: EmailAuthProvider.injectName,
      useClass: EmailAuthProvider,
    },
    {
      provide: PhoneAuthProvder.injectName,
      useClass: PhoneAuthProvder,
    },
    AuthService, AuthResolver, AccessTokenStretegy, RefreshTokenStrategy,
    UserResolver
  ],
})
export class AuthModule { }
