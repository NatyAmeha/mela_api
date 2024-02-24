import { Module } from '@nestjs/common';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionService } from './subscription.service';
import { GraphQLModule } from '@nestjs/graphql';
import { Subscriptionconfiguration } from '../subscription_service.config';
import { LoggerModule } from '@app/logger';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionPlanRepository } from './repo/subscription_plan.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [Subscriptionconfiguration],
    }),
    LoggerModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => {
        return {
          autoSchemaFile: './apps/subscription/schema.gql',
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
    { provide: SubscriptionPlanRepository.InjectName, useClass: SubscriptionPlanRepository },
    SubscriptionResolver, SubscriptionService],
})
export class SubscriptionModule { }