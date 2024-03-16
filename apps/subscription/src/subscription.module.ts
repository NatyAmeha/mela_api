import { Inject, Module } from '@nestjs/common';
import { SubscriptionResolver } from './resolver/subscription.resolver';
import { SubscriptionService } from './usecase/subscription.usecase';
import { GraphQLModule } from '@nestjs/graphql';
import { Subscriptionconfiguration } from '../subscription_service.config';
import { LoggerModule } from '@app/logger';
import { ApolloDriver, ApolloDriverConfig, ApolloFederationDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscriptionRepository } from './repo/subscription.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqModule } from 'libs/rmq/rmq_module';
import { SubscriptionMessageBrocker } from './subscription_message_brocker';
import { PlatformServiceRepository } from './repo/platform_service.repo';
import { PlatformServiceResolver } from './resolver/platform_service.resolver';
import { PlatfromUsecase } from './usecase/platform.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [Subscriptionconfiguration],
    }),
    // RmqModule.register(SUBSCRIPTION_RMQ_CLIENT),
    RmqModule,

    LoggerModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloFederationDriver,
      useFactory: () => {
        return {
          autoSchemaFile: {
            federation: 2,
            path: './apps/subscription/schema.gql'
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
    }),

  ],
  controllers: [],
  providers: [
    { provide: SubscriptionRepository.InjectName, useClass: SubscriptionRepository },
    { provide: SubscriptionMessageBrocker.InjectName, useClass: SubscriptionMessageBrocker },
    { provide: PlatformServiceRepository.InjectName, useClass: PlatformServiceRepository },
    SubscriptionResolver, SubscriptionService, PlatformServiceResolver, PlatfromUsecase],
})
export class SubscriptionModule { }
