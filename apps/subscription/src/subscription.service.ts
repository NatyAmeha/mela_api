import { Inject, Injectable } from '@nestjs/common';
import { ISubscriptionPlanRepository, SubscriptionPlanRepository } from './repo/subscription_plan.repository';
import { SubscriptionPlan } from './model/subscription_plan.model';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';
import { CreateSubscriptionInput } from './dto/subscription.input';
import { Subscription } from './model/subscription.model';
import { SubscriptionResponse } from './model/subscription.response';

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

  async updateSubscriptionPlanInfo(planId: string, updatedPlanInfo: SubscriptionPlan): Promise<SubscriptionResponse> {
    var planInfo = await this.subscriptionPlanRepo.getSubscriptionPlan(planId);
    var updateResult = await this.subscriptionPlanRepo.updateSubscriptionPlanInfo(planInfo.id, { ...updatedPlanInfo })
    if (!updateResult) {
      return {
        success: false
      }
    }
    return {
      success: true,
      plan: planInfo,
    }
  }

  async updateSubscriptionPlanStatus(planId: string, status: boolean) {
    var result = await this.subscriptionPlanRepo.updateSubscriptionPlanInfo(planId, { isActive: status })
    return result;
  }

  async subscribeToPlan(info: CreateSubscriptionInput): Promise<SubscriptionResponse> {
    var plan = await this.getSubscriptionPlan(info.subscriptioinPlanId);
    var subscriptionInfo = info.getSubscriptionInfoFromPlan(plan);
    var activeSubscription = await this.subscriptionPlanRepo.getActiveSubscriptions(plan.id, plan.owner);
    if (activeSubscription.length > 0) {
      return {
        success: false,
        message: "You already have active subscription for this plan",
        existingActiveSubscriptions: activeSubscription,
        plan: plan
      }
    }
    else {
      var result = await this.subscriptionPlanRepo.createSubscription(subscriptionInfo)
      return {
        success: true,
        subscription: result,
        plan: plan
      }
    }

  }
}
