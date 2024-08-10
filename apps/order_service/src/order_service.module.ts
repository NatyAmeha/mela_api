import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { RmqModule } from 'libs/rmq/rmq_module';
import { CommonModule } from '@app/common';
import { LoggerModule } from '@app/logger';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloFederationDriver } from '@nestjs/apollo';
import { orderServiceConfiguration } from '../order_service.config';
import { OrderService } from './usecase/order.usecase';
import { OrderRepository } from './repo/order_repository';
import { OrderResolver } from './resolver/order.resolver';
import { CartRepository } from './repo/cart.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [orderServiceConfiguration],
    }),
    RmqModule,
    CommonModule,
    LoggerModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloFederationDriver,
      useFactory: () => {
        return {
          autoSchemaFile: {
            federation: 2,
            path: './apps/order_service/schema.gql'
          },
          sortSchema: true,
          playground: true,
          context: ({ req }) => ({ headers: req.headers })
        }
      }
    }),
  ],
  controllers: [],
  providers: [
    { provide: OrderRepository.injectName, useClass: OrderRepository },
    { provide: CartRepository.injectName, useClass: CartRepository },
    OrderService, OrderResolver
  ],
})
export class OrderServiceModule { }
