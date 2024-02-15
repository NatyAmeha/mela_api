import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './usecase/auth.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { CommonModule } from '@app/common';
import { UserRepository } from './data/repo/user.repository';
import { LoggerModule } from '@app/logger';
import { configuration } from 'apps/auth/configuration';
import { AccessTokenStretegy } from './service/jwt.service';
import { RefreshTokenStrategy } from './service/jwt_refresh.service';
import { JwtModule } from '@nestjs/jwt';
import { DatasourceModule, AuthServicePrismaDataSource } from '@app/datasource';
import { User } from './model/user.model';



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
    DatasourceModule,
    JwtModule.register({}),
    LoggerModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: './apps/auth/schema.gql',
      sortSchema: true,
      playground: true,
    })
  ],
  controllers: [],
  providers: [
    {
      provide: UserRepository.injectName,
      useClass: UserRepository
    },
    {
      provide: AuthServicePrismaDataSource.injectName,
      useClass: AuthServicePrismaDataSource
    },
    AuthService, AuthResolver, AccessTokenStretegy, RefreshTokenStrategy
  ],
})
export class AuthModule { }
