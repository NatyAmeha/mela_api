import { Inject, Injectable } from '@nestjs/common';
import { ISubscritpionRepository, SubscriptionRepository } from '../repo/subscription.repository';
import { SubscriptionPlan } from '../model/subscription_plan.model';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';
import { CreatePlatformServiceSubscriptionInput, CreateSubscriptionInput } from '../dto/subscription.input';
import { PlatfromServiceSubscription, Subscription } from '../model/subscription.model';
import { SubscriptionResponse } from '../model/subscription.response';
import { SubscriptionType } from '../model/subscription_type.enum';
import { IPlatformServiceRepo, PlatformServiceRepository } from '../repo/platform_service.repo';
import { SubscriptionHelper } from '../utils/subscription.helper';
import { ISubscriptionOption, SubscriptionFactory } from '../utils/subscrption_factory';
import { RequestValidationException } from '@app/common/errors/request_validation_exception';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SubscriptionRepository.InjectName) private subscriptionRepo: ISubscritpionRepository,
    @Inject(PlatformServiceRepository.InjectName) private platformServcieRepo: IPlatformServiceRepo,
    private subscriptionFactory: SubscriptionFactory,
    private subscriptionHelper: SubscriptionHelper,
  ) {

  }
  async createSubscriptionPlan(planInfo: SubscriptionPlan) {
    let result = await this.subscriptionRepo.createSubscriptionPlan(planInfo)
    return result;
  }
  async getSubscriptionPlan(planId: string) {
    let result = await this.subscriptionRepo.getSubscriptionPlan(planId);
    return result;
  }

  async getSubscriptions(queryInfo: QueryHelper<SubscriptionPlan>) {
    let result = await this.subscriptionRepo.getPlans(queryInfo);
    return result;
  }

  async updateSubscriptionPlanInfo(planId: string, updatedPlanInfo: SubscriptionPlan): Promise<SubscriptionResponse> {
    let planInfo = await this.subscriptionRepo.getSubscriptionPlan(planId);
    let updateResult = await this.subscriptionRepo.updateSubscriptionPlanInfo(planInfo.id, { ...updatedPlanInfo })
    if (!updateResult) {
      return <SubscriptionResponse>{
        success: false
      }
    }
    return <SubscriptionResponse>{
      success: true,
      plan: planInfo,
    }
  }

  async updateSubscriptionPlanStatus(planId: string, status: boolean) {
    let result = await this.subscriptionRepo.updateSubscriptionPlanInfo(planId, { isActive: status })
    return result;
  }

  async updateSubscriptionStatus(subscritpionId: string, status: boolean) {
    let result = await this.subscriptionRepo.updateSubscriptionInfo(subscritpionId, { isActive: status })
    return result;
  }

  async subscribeToPlan(info: CreateSubscriptionInput): Promise<SubscriptionResponse> {
    let response = await this.subscriptionFactory.create(info.type).createSubscriptionInfo(info);
    if (response.success) {
      let saveSubscriptionResult = await this.subscriptionRepo.createSubscription(response.createdSubscription)
      response.createdSubscription = saveSubscriptionResult;
      return response
    }
    else {
      throw new RequestValidationException({ message: response.message, statusCode: 400 })
    }
  }

  async addPlatformServiceToSubscription(subscriptionId: string, subscriptionInfo: CreatePlatformServiceSubscriptionInput[]): Promise<SubscriptionResponse> {
    let newPlatformServiceInfo = await Promise.all(subscriptionInfo.map(async info => {
      var input = new CreatePlatformServiceSubscriptionInput({ ...info })
      return await input.generatePlatformServiceSubscriptionInfo(this.platformServcieRepo)
    }))
    let existingSubscriptionInfo = await this.subscriptionRepo.getSubscriptionInfo(subscriptionId)
    var existingPlatformServiceInSubscription = existingSubscriptionInfo.getPlatformServiceAlreadyInSubscriptioin(newPlatformServiceInfo)
    if (existingPlatformServiceInSubscription.length > 0) {
      return <SubscriptionResponse>{
        success: false,
        message: "Platform service is already in subscription, check existing services field",
        existingPlatformService: existingPlatformServiceInSubscription
      }
    }

    let updateResult = await this.subscriptionRepo.updateSubscriptionInfo(subscriptionId, { platformServices: [...existingSubscriptionInfo.platformServices, ...newPlatformServiceInfo] })
    return <SubscriptionResponse>{
      success: true,
      createdSubscription: { ...existingSubscriptionInfo, platformServices: [...existingSubscriptionInfo.platformServices, ...newPlatformServiceInfo] },
      addedPlatformServices: newPlatformServiceInfo
    }
  }

  async deleteSubscriptionPlan(planId: string): Promise<SubscriptionResponse> {
    let result = await this.subscriptionRepo.deleteSubscriptionPlan(planId)
    return result;
  }
}
