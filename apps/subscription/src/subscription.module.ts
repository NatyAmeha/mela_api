import { Module } from '@nestjs/common';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionService } from './subscription.service';
import { GraphQLModule } from '@nestjs/graphql';
import { Subscriptionconfiguration } from '../subscription_service.config';
import { LoggerModule } from '@app/logger';
import { ApolloDriver, ApolloDriverConfig, ApolloFederationDriver } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionRepository } from './repo/subscription.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [Subscriptionconfiguration],
    }),
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
    SubscriptionResolver, SubscriptionService],
})
export class SubscriptionModule { }
