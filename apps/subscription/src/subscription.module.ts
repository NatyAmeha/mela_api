import { Inject, Module } from '@nestjs/common';
import { SubscriptionResolver } from './resolver/subscription.resolver';
import { SubscriptionService } from './usecase/subscription.usecase';
import { GraphQLModule } from '@nestjs/graphql';
import { Subscriptionconfiguration } from '../subscription_service.config';
import { LoggerModule } from '@app/logger';
import { ApolloDriver, ApolloDriverConfig, ApolloFederationDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubscriptionRepository } from './repo/subscription.repository';
import { RmqModule } from 'libs/rmq/rmq_module';
import { SubscriptionMessageBrocker } from './msg_brocker_client/subscription_message_brocker';
import { PlatformServiceRepository } from './repo/platform_service.repo';
import { PlatformServiceResolver } from './resolver/platform_service.resolver';
import { PlatfromUsecase } from './usecase/platform.usecase';
import { SubscriptionAccessGenerator } from './utils/subscription_access_generator';
import { BusinessSubscriptionOption, MembershipSubscriptionOption, PlatformSubscriptionOption, SubscriptionFactory } from './utils/subscrption_factory';
import { CommonModule } from '@app/common';
import { SubscriptionMsgProcessosor } from './msg_brocker_client/subscription_service_msg_processor';
import { MembershipResolver } from './membership/resolver/membership.resolver';
import { MembershipService } from './membership/resolver/membership.service';
import { MembershipRepository } from './membership/repo/membership.repo';
import { MembershipResourceTracker } from './membership/membership_resource_usage_tracker';
import { GroupResolver } from './membership/resolver/group.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [Subscriptionconfiguration],
    }),
    // RmqModule.register(SUBSCRIPTION_RMQ_CLIENT),
    RmqModule,
    CommonModule,
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
    { provide: SubscriptionAccessGenerator.injectName, useClass: SubscriptionAccessGenerator },

    { provide: SubscriptionMsgProcessosor.InjectName, useClass: SubscriptionMsgProcessosor },

    SubscriptionResolver, SubscriptionService, PlatformServiceResolver, PlatfromUsecase,
    SubscriptionFactory, PlatformSubscriptionOption, BusinessSubscriptionOption, PlatformServiceRepository, MembershipSubscriptionOption,

    { provide: MembershipRepository.injectName, useClass: MembershipRepository },
    MembershipResolver, MembershipService, MembershipResourceTracker, GroupResolver,


  ],
})
export class SubscriptionModule { }
