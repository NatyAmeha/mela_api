import { Controller, Get } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Query, Resolver } from '@nestjs/graphql';
import { SubscriptionPlan } from './model/subscription_plan.model';
import { Subscription } from './model/subscription.model';

@Resolver(of => [SubscriptionPlan])
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Query(returns => String)
  getHello(): string {
    return this.subscriptionService.getHello();
  }
}
