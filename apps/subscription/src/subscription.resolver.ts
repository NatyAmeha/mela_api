import { Controller, Get } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionPlan } from './model/subscription_plan.model';
import { Subscription } from './model/subscription.model';
import { CreateSubscriptionPlanInput } from './dto/subscription_plan.input';
import { SubscriptionType } from './model/subscription_type.enum';

@Resolver(of => [SubscriptionPlan])
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Query(returns => String)
  getHello(): string {
    return "subscription result"
  }


  @Mutation(returns => SubscriptionPlan)
  async createPlatformSubscriptionPlan(@Args("plan") plan: CreateSubscriptionPlanInput) {
    var subscriptionInfo = plan.getSubscriptionInfo({ subscriptionType: SubscriptionType.PLATFORM, isActiveSubscription: false })
    var result = await this.subscriptionService.createSubscriptionPlan(subscriptionInfo);
    return result;
  }
}
