import { Inject, Injectable } from '@nestjs/common';
import { ISubscriptionPlanRepository, SubscriptionPlanRepository } from './repo/subscription_plan.repository';
import { SubscriptionPlan } from './model/subscription_plan.model';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';

@Injectable()
export class SubscriptionService {
  constructor(@Inject(SubscriptionPlanRepository.InjectName) private subscriptionPlanRepo: ISubscriptionPlanRepository) {

  }
  async createSubscriptionPlan(planInfo: SubscriptionPlan) {
    var result = await this.subscriptionPlanRepo.createSubscriptionPlan(planInfo)
    return result;
  }

  async getSubscriptions(queryInfo: QueryHelper<SubscriptionPlan>) {
    var result = await this.subscriptionPlanRepo.getPlans(queryInfo);
    return result;
  }
}
