import { Inject, Injectable } from '@nestjs/common';
import { ISubscritpionRepository, SubscriptionRepository } from '../repo/subscription.repository';
import { SubscriptionPlan } from '../model/subscription_plan.model';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';
import { CreateSubscriptionInput } from '../dto/subscription.input';
import { Subscription } from '../model/subscription.model';
import { SubscriptionResponse } from '../model/subscription.response';
import { SubscriptionType } from '../model/subscription_type.enum';
import { IPlatformServiceRepo, PlatformServiceRepository } from '../repo/platform_service.repo';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SubscriptionRepository.InjectName) private subscriptionRepo: ISubscritpionRepository,
    @Inject(PlatformServiceRepository.InjectName) private platformServcieRepo: IPlatformServiceRepo) {

  }
  async createSubscriptionPlan(planInfo: SubscriptionPlan) {
    var result = await this.subscriptionRepo.createSubscriptionPlan(planInfo)
    return result;
  }
  async getSubscriptionPlan(planId: string) {
    var result = await this.subscriptionRepo.getSubscriptionPlan(planId);
    return result;
  }

  async getSubscriptions(queryInfo: QueryHelper<SubscriptionPlan>) {
    var result = await this.subscriptionRepo.getPlans(queryInfo);
    return result;
  }

  async updateSubscriptionPlanInfo(planId: string, updatedPlanInfo: SubscriptionPlan): Promise<SubscriptionResponse> {
    var planInfo = await this.subscriptionRepo.getSubscriptionPlan(planId);
    var updateResult = await this.subscriptionRepo.updateSubscriptionPlanInfo(planInfo.id, { ...updatedPlanInfo })
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
    var result = await this.subscriptionRepo.updateSubscriptionPlanInfo(planId, { isActive: status })
    return result;
  }

  async updateSubscriptionStatus(subscritpionId: string, status: boolean) {
    var result = await this.subscriptionRepo.updateSubscriptionInfo(subscritpionId, { isActive: status })
    return result;
  }

  async subscribeToPlan(info: CreateSubscriptionInput): Promise<SubscriptionResponse> {
    var subscriptionInfo: Subscription
    if (info.type == SubscriptionType.PLATFORM) {
      subscriptionInfo = await info.getSubscriptionInfoForPlatformService(this.platformServcieRepo)
      var result = await this.subscriptionRepo.createSubscription(subscriptionInfo)
      return {
        success: true,
        createdSubscription: result,
        plan: plan
      }
    }
    else {
      var plan = await this.getSubscriptionPlan(info.subscriptioinPlanId);
      subscriptionInfo = info.getSubscriptionInfoFromPlan(plan);
      var activeSubscription = await this.subscriptionRepo.getActiveSubscriptions(plan.id, plan.owner);
      if (activeSubscription.length > 0) {
        return {
          success: false,
          message: "You already have active subscription for this plan",
          existingActiveSubscriptions: activeSubscription,
          plan: plan
        }
      }
      else {
        var result = await this.subscriptionRepo.createSubscription(subscriptionInfo)
        return {
          success: true,
          createdSubscription: result,
          plan: plan
        }
      }
    }
  }

  async deleteSubscriptionPlan(planId: string): Promise<SubscriptionResponse> {
    var result = await this.subscriptionRepo.deleteSubscriptionPlan(planId)
    return result;
  }
}
