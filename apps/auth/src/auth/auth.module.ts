import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './usecase/auth.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig, ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { CommonModule } from '@app/common';
import { UserRepository } from './data/repo/user.repository';
import { LoggerModule } from '@app/logger';
import { configuration } from 'apps/auth/auth_configuration';
import { AccessTokenStretegy } from './service/guard/jwt.service';
import { RefreshTokenStrategy } from './service/guard/jwt_refresh.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthSecurityService } from './service/auth_security.service';
import { AppException } from '@app/common/errors/app_exception.model';
import { EmailAuthProvider } from './service/auth_provider/email_auth_provider';
import { PhoneAuthProvder } from './service/auth_provider/phone_auth_provider';
import { UserResolver } from './user.resolver';
import { AuthorizationModule } from '../authorization';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqModule } from 'libs/rmq/rmq_module';
import { AUTH_RMQ_CLIENT } from '../cosntants';
import { AuthServiceMsgBrocker } from '../msg_brocker_client/auth_service_msg_brocker';
import { AuthController } from './auth.controller';
import { AuthMsgProcessosor } from '../msg_brocker_client/auth_msg_processor';
import { UserService } from './usecase/user.service';



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
    RmqModule,
    CommonModule,
    JwtModule.register({}),
    LoggerModule,
    AuthorizationModule,
    GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      useFactory: () => {
        return {
          autoSchemaFile: {
            path: './apps/auth/schema.gql',
            federation: 2
          },
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
  controllers: [AuthController],
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
    { provide: AuthServiceMsgBrocker.InjectName, useClass: AuthServiceMsgBrocker },
    AuthService, AuthResolver, AccessTokenStretegy, RefreshTokenStrategy,
    UserResolver, UserService,

    { provide: AuthMsgProcessosor.InjectName, useClass: AuthMsgProcessosor }
  ],
})
export class AuthModule { }
