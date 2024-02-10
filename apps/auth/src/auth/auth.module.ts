import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      // validationSchema: Joi.object({
      //   "NODE_ENV" : Joi.string().valid("development", "production").default("development")
      // })
    }),
    CommonModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: './apps/auth/schema.gql',
      sortSchema: true,
      playground: true,
    })
  ],
  controllers: [],
  providers: [AuthService, AuthResolver],
})
export class AuthModule { }
