import { Inject, Injectable } from '@nestjs/common';
import { ISubscriptionPlanRepository, SubscriptionPlanRepository } from './repo/subscription_plan.repository';
import { SubscriptionPlan } from './model/subscription_plan.model';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';
import { CreateSubscriptionInput } from './dto/subscription.input';
import { Subscription } from './model/subscription.model';

@Injectable()
export class SubscriptionService {
  constructor(@Inject(SubscriptionPlanRepository.InjectName) private subscriptionPlanRepo: ISubscriptionPlanRepository) {

  }
  async createSubscriptionPlan(planInfo: SubscriptionPlan) {
    var result = await this.subscriptionPlanRepo.createSubscriptionPlan(planInfo)
    return result;
  }
  async getSubscriptionPlan(planId: string) {
    var result = await this.subscriptionPlanRepo.getSubscriptionPlan(planId);
    return result;
  }

  async getSubscriptions(queryInfo: QueryHelper<SubscriptionPlan>) {
    var result = await this.subscriptionPlanRepo.getPlans(queryInfo);
    return result;
  }

  async updateSubscriptionStatus(planId: string, status: boolean) {
    var result = await this.subscriptionPlanRepo.updateSubscriptionInfo(planId, { isActive: status })
    return result;
  }

  async subscribeToPlan(info: CreateSubscriptionInput): Promise<Subscription> {
    var plan = await this.getSubscriptionPlan(info.subscriptioinPlanId);
    var subscriptionInfo = info.getSubscriptionInfoFromPlan(plan);
    var result = await this.subscriptionPlanRepo.createSubscription(subscriptionInfo)
    return result;

  }
}
