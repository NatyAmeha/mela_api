import { Module } from '@nestjs/common';
import { CoreController } from './core.controller';
import { CoreService } from './core.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../configuration';
import { RmqModule } from 'libs/rmq/rmq_module';
import { LoggerModule } from '@app/logger';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloFederationDriver } from '@nestjs/apollo';

import { BusinessModule } from './business/business.module';

@Module({
  imports: [
    BusinessModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
    }),
    RmqModule,
    LoggerModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloFederationDriver,
      useFactory: () => {
        return {
          autoSchemaFile: {
            federation: 2,
            path: './apps/core/schema.gql'
          },
          sortSchema: true,
          playground: true,
          context: ({ req }) => ({ headers: req.headers })
        }
      }
    }),
  ],

  providers: [CoreService],
  exports: [BusinessModule]
})
export class CoreModule { }
