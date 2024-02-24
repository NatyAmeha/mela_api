import { Controller, Get } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionPlan } from './model/subscription_plan.model';
import { Subscription } from './model/subscription.model';
import { CreateSubscriptionPlanInput } from './dto/subscription_plan.input';
import { SubscriptionType } from './model/subscription_type.enum';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';
import { CreateSubscriptionInput } from './dto/subscription.input';

@Resolver(of => [SubscriptionPlan])
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Mutation(returns => SubscriptionPlan)
  async createPlatformSubscriptionPlan(@Args("plan") plan: CreateSubscriptionPlanInput) {
    var subscriptionInfo = plan.getSubscriptionInfo({ subscriptionType: SubscriptionType.PLATFORM, isActiveSubscription: false })
    var result = await this.subscriptionService.createSubscriptionPlan(subscriptionInfo);
    return result;
  }

  @Query(returns => [SubscriptionPlan])
  async getSubscriptionPlans(@Args({ name: "type", type: () => SubscriptionType, nullable: true }) type: SubscriptionType, @Args({ name: "owner", nullable: true }) owner?: string) {
    var queryHelper: QueryHelper<SubscriptionPlan> = {
      query: { type, owner } as SubscriptionPlan
    }
    var result = await this.subscriptionService.getSubscriptions(queryHelper)
    return result;
  }

  @Mutation(returns => SubscriptionPlan)
  async createBusinessSubscriptionPlan(@Args("plan") plan: CreateSubscriptionPlanInput) {
    var subscriptionInfo = plan.getSubscriptionInfo({ subscriptionType: SubscriptionType.BUSINESS, isActiveSubscription: false })
    var result = await this.subscriptionService.createSubscriptionPlan(subscriptionInfo);
    return result;
  }

  @Mutation(returns => SubscriptionPlan)
  async createServiceSubscriptionPlan(@Args("plan") plan: CreateSubscriptionPlanInput) {
    var subscriptionInfo = plan.getSubscriptionInfo({ subscriptionType: SubscriptionType.SERVICE, isActiveSubscription: false })
    var result = await this.subscriptionService.createSubscriptionPlan(subscriptionInfo);
    return result;
  }

  @Query(returns => [SubscriptionPlan])
  async getBusienssSubscriptionPlans(@Args({ name: "type", type: () => SubscriptionType, nullable: true }) type: SubscriptionType, @Args({ name: "owner", nullable: true }) owner?: string) {
    var queryHelper: QueryHelper<SubscriptionPlan> = {
      query: { type, owner } as SubscriptionPlan
    }
    var result = await this.subscriptionService.getSubscriptions(queryHelper)
    return result;
  }

  @Mutation(returns => Boolean)
  async changeSubscriptionStatus(@Args("subscription") subscriptionId: string, @Args("status") status: boolean) {
    var result = await this.subscriptionService.updateSubscriptionStatus(subscriptionId, status)
    return result;
  }

  @Mutation(returns => Subscription)
  async subscribeToPlan(@Args("info") info: CreateSubscriptionInput): Promise<Subscription> {
    var subscriptionPlan = await this.subscriptionService.subscribeToPlan(info);
    return subscriptionPlan;
  }
}
