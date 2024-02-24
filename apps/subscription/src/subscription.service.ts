import { Inject, Injectable } from '@nestjs/common';
import { ISubscriptionPlanRepository, SubscriptionPlanRepository } from './repo/subscription_plan.repository';
import { SubscriptionPlan } from './model/subscription_plan.model';

@Injectable()
export class SubscriptionService {
  constructor(@Inject(SubscriptionPlanRepository.InjectName) private subscriptionPlanRepo: ISubscriptionPlanRepository) {

  }
  async createSubscriptionPlan(planInfo: SubscriptionPlan) {
    var result = await this.subscriptionPlanRepo.createSubscriptionPlan(planInfo)
    return result;
  }
}
