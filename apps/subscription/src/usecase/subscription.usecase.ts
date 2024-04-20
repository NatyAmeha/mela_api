import { Inject, Injectable } from '@nestjs/common';
import { ISubscritpionRepository, SubscriptionRepository } from '../repo/subscription.repository';
import { SubscriptionPlan } from '../model/subscription_plan.model';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';
import { CreatePlatformServiceSubscriptionInput, CreateSubscriptionInput } from '../dto/subscription.input';
import { PlatfromServiceSubscription, Subscription } from '../model/subscription.model';
import { SubscriptionResponse } from '../model/response/subscription.response';
import { SubscriptionType } from '../model/subscription_type.enum';
import { IPlatformServiceRepo, PlatformServiceRepository } from '../repo/platform_service.repo';
import { SubscriptionHelper } from '../utils/subscription.helper';
import { ISubscriptionOption, SubscriptionFactory } from '../utils/subscrption_factory';
import { RequestValidationException } from '@app/common/errors/request_validation_exception';
import { SubscriptionUpgradeInput } from '../dto/update_subscription.input';
import { SubscriptionUpgradeResponse } from '../model/response/subscription_upgrade.response';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SubscriptionRepository.InjectName) private subscriptionRepo: ISubscritpionRepository,
    @Inject(PlatformServiceRepository.InjectName) private platformServcieRepo: IPlatformServiceRepo,
    private subscriptionFactory: SubscriptionFactory,
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

  async updateSubscriptionStatus(subscriptionId: string, status: boolean) {
    let result = await this.subscriptionRepo.updateSubscriptionInfo(subscriptionId, { isActive: status })
    return result;
  }

  async subscribeToPlan(info: CreateSubscriptionInput): Promise<SubscriptionResponse> {
    let response = await this.subscriptionFactory.create(info.type).createSubscriptionInfo(info, 250);
    if (response.success) {
      let saveSubscriptionResult = await this.subscriptionRepo.createSubscription(response.createdSubscription)
      response.createdSubscription = saveSubscriptionResult;
      return response
    }
    else {
      throw new RequestValidationException({ message: response.message, statusCode: 400 })
    }
  }

  // async addPlatformServiceToSubscription(subscriptionId: string, subscriptionInfo: CreatePlatformServiceSubscriptionInput[]): Promise<SubscriptionResponse> {
  //   let newPlatformServiceInfo = await Promise.all(subscriptionInfo.map(async info => {
  //     let input = new CreatePlatformServiceSubscriptionInput({ ...info })
  //      this.subscriptionFactory.create(SubscriptionType.PLATFORM).createSubscriptionInfo()
  //     return await input.generatePlatformServiceSubscriptionInfo(this.platformServcieRepo)
  //   }))
  //   let existingSubscriptionInfo = await this.subscriptionRepo.getSubscriptionInfo(subscriptionId)
  //   let existingPlatformServiceInSubscription = existingSubscriptionInfo.getPlatformServiceAlreadyInSubscriptioin(newPlatformServiceInfo)
  //   if (existingPlatformServiceInSubscription.length > 0) {
  //     return <SubscriptionResponse>{
  //       success: false,
  //       message: "Platform service is already in subscription, check existing services field",
  //       existingPlatformService: existingPlatformServiceInSubscription
  //     }
  //   }

  //   let updateResult = await this.subscriptionRepo.updateSubscriptionInfo(subscriptionId, { platformServices: [...existingSubscriptionInfo.platformServices, ...newPlatformServiceInfo] })
  //   return <SubscriptionResponse>{
  //     success: true,
  //     createdSubscription: { ...existingSubscriptionInfo, platformServices: [...existingSubscriptionInfo.platformServices, ...newPlatformServiceInfo] },
  //     addedPlatformServices: newPlatformServiceInfo
  //   }
  // }

  async getSubscriptionUpgradeInfo(subscriptionId: string, subscriptionInput: SubscriptionUpgradeInput): Promise<SubscriptionUpgradeResponse> {
    let subscriptionInfo = await this.subscriptionRepo.getSubscriptionInfo(subscriptionId)
    let platformServices = await this.platformServcieRepo.getAllPlatformServices();
    let subscriptionOption = this.subscriptionFactory.create(subscriptionInfo.type);
    let result = await subscriptionOption.getSubscriptionUpgradeInfo(subscriptionInfo, platformServices, subscriptionInput)
    return result;
  }

  async renewSubscription(subscriptionId: string, subscriptionInput: SubscriptionUpgradeInput): Promise<SubscriptionResponse> {
    let businessHasSubscription = await this.subscriptionRepo.ownerHasSubscription(subscriptionInput.businessId, subscriptionId)
    if (!businessHasSubscription) {
      throw new RequestValidationException({ message: "Business does not have subscription", statusCode: 400 })
    }
    let subscriptionUpgradeInfo = await this.getSubscriptionUpgradeInfo(subscriptionId, subscriptionInput)
    let newSubscriptionInfo = await this.subscriptionFactory.create(SubscriptionType.PLATFORM).createSubscriptionInfoFromSubscriptionUpgradeInfo(subscriptionUpgradeInfo)
    if (newSubscriptionInfo.success) {
      let saveSubscriptionResult = await this.subscriptionRepo.createSubscription(newSubscriptionInfo.createdSubscription)
      newSubscriptionInfo.createdSubscription = saveSubscriptionResult;
      return newSubscriptionInfo
    }
    else {
      throw new RequestValidationException({ message: newSubscriptionInfo.message, statusCode: 400 })
    }
  }

  async deleteSubscriptionPlan(planId: string): Promise<SubscriptionResponse> {
    let result = await this.subscriptionRepo.deleteSubscriptionPlan(planId)
    return result;
  }
}
