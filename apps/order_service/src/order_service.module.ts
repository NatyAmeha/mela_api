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
import { LoyaltyRepository } from './loyalty/repo/loyalty.repository';
import { CustomerService } from './customer/customer.service';
import { LoyaltyService } from './loyalty/loyalty.service';
import { CustomerRepository } from './customer/repo/customer.repository';
import { LoyaltyRewardResolver } from './loyalty/loyalty_reward.resolver';
import { CustomerResolver } from './customer/customer.resolver';

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
    { provide: LoyaltyRepository.injectName, useClass: LoyaltyRepository },
    { provide: CustomerRepository.injectName, useClass: CustomerRepository },

    OrderService, OrderResolver, CustomerService, LoyaltyService, LoyaltyRewardResolver, CustomerResolver
  ],
})
export class OrderServiceModule { }
