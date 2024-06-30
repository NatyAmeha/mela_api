import { Inject, UseGuards } from '@nestjs/common';
import { SubscriptionService } from '../usecase/subscription.usecase';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionPlan } from '../model/subscription_plan.model';
import { Subscription } from '../model/subscription.model';
import { CreateSubscriptionPlanInput, UpdateSubscriptionPlanInput } from '../dto/subscription_plan.input';
import { SubscriptionType } from '../model/subscription_type.enum';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';
import { CreatePlatformSubscriptionInput } from '../dto/platform_service_subscription.input';
import { SubscriptionResponse } from '../model/response/subscription.response';
import { SubscriptionMessageBrocker } from '../msg_brocker_client/subscription_message_brocker';
import { AuthzGuard } from 'libs/common/authorization.guard';
import { CurrentUser } from 'libs/common/get_user_decorator';
import { UserInfo } from '@app/common/model/gateway_user.model';
import { IAccessGenerator } from '@app/common/permission_helper/access_factory.interface';
import { SubscriptionAccessGenerator } from '../utils/subscription_access_generator';
import { RequiresPermission } from '@app/common/permission_helper/require_permission.decorator';
import { PERMISSIONACTION } from '@app/common/permission_helper/permission_constants';
import { PermissionGuard } from '@app/common/permission_helper/permission.guard';
import { SubscriptionUpgradeResponse } from '../model/response/subscription_upgrade.response';
import { SubscriptionUpgradeInput } from '../dto/update_subscription.input';
import { AppResources } from 'apps/mela_api/src/const/app_resource.constant';



@Resolver(of => [SubscriptionResponse, SubscriptionPlan])
export class SubscriptionResolver {
  constructor(
    @Inject(SubscriptionMessageBrocker.InjectName) private subscriptionBroker: SubscriptionMessageBrocker,
    private readonly subscriptionService: SubscriptionService,
    @Inject(SubscriptionAccessGenerator.injectName) private subscriptionAccessGenerator: IAccessGenerator<Subscription>

  ) { }

  @UseGuards(AuthzGuard)
  @Mutation(returns => SubscriptionPlan)
  async createPlatformSubscriptionPlan(@Args("plan") plan: CreateSubscriptionPlanInput) {
    let subscriptionInfo = plan.getSubscriptionInfo({ subscriptionType: SubscriptionType.PLATFORM, isActiveSubscription: false })
    let result = await this.subscriptionService.createSubscriptionPlan(subscriptionInfo);
    return result;
  }

  @Query(returns => [SubscriptionPlan])
  async getSubscriptionPlans(
    @CurrentUser() data: UserInfo,
    @Args({ name: "type", type: () => SubscriptionType, nullable: true }) type: SubscriptionType,
    @Args({ name: "owner", nullable: true },) owner?: string,
  ) {
    let queryHelper: QueryHelper<SubscriptionPlan> = {
      query: { type, owner } as SubscriptionPlan
    }
    let result = await this.subscriptionService.getSubscriptions(queryHelper)
    return result;
  }



  @Mutation(returns => SubscriptionPlan)
  @UseGuards(AuthzGuard)
  async createBusinessSubscriptionPlan(@Args("plan") plan: CreateSubscriptionPlanInput) {
    let subscriptionInfo = plan.getSubscriptionInfo({ subscriptionType: SubscriptionType.BUSINESS, isActiveSubscription: false })
    let result = await this.subscriptionService.createSubscriptionPlan(subscriptionInfo);
    return result;
  }


  @RequiresPermission({ permissions: [{ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE }] })
  @UseGuards(PermissionGuard)
  @Mutation(returns => SubscriptionResponse)
  async subscribeBusinessToPlatformServices(@Args("id", { description: "id of the business" }) businessId: string, @Args("input") planInput: CreatePlatformSubscriptionInput) {
    // get business info from core service
    let businessInfo = await this.subscriptionBroker.getBusinessInformationFromCoreService(businessId)
    let subscritpionResponse = await this.subscriptionService.subscribeToPlatformServices(planInput, businessInfo.business);
    if (!subscritpionResponse.success) {
      return subscritpionResponse
    }

    // create access permission for business on auth servcie
    let platformServiceAccess = await this.subscriptionAccessGenerator.createAccess(subscritpionResponse.subscription, SubscriptionType.PLATFORM);
    let reply = await this.subscriptionBroker.createPlatformServiceAccessPermission(platformServiceAccess);
    if (reply.success) {
      let updateResult = await this.subscriptionService.updateSubscriptionStatus(subscritpionResponse.subscription!.id!, true)
      subscritpionResponse.changeSubscritpioStatus(updateResult)
      // subscritpionResponse.createdSubscription.isActive = updateResult

      // Sned subscription created event to core service to update business registration stage
      let sendResult = await this.subscriptionBroker.sendSubscriptionCreatedEventToServices(subscritpionResponse)
      console.log("subscritpion status update", updateResult, sendResult)
    }
    // update subscription status
    return subscritpionResponse
  }



  @Query(returns => SubscriptionUpgradeResponse)
  async getPriceInfoToUpgradeSubscription(@Args("id", { description: "Subscritpion id" }) subscriptionId: string, @Args("subscriptionUpdateInfo") updatePlatformSubscriptionInput: SubscriptionUpgradeInput): Promise<SubscriptionUpgradeResponse> {
    let subscriptionUpgradeResponse = await this.subscriptionService.getSubscriptionUpgradeInfo(subscriptionId, updatePlatformSubscriptionInput)
    return subscriptionUpgradeResponse
  }

  @RequiresPermission(
    {
      permissions: [
        { resourceType: AppResources.PLATFORM_SERVICE_SUBSCRIPTION, action: PERMISSIONACTION.MANAGE },
      ],
    }
  )
  @UseGuards(PermissionGuard)
  @Mutation(returns => SubscriptionResponse)
  async renewBusienssPlatformSubscription(@Args("id") id: string, @Args("subscriptionUpdateInfo") data: SubscriptionUpgradeInput): Promise<SubscriptionResponse> {
    let subscriptionUpgradeResponse = await this.subscriptionService.renewSubscription(id, data);
    if (subscriptionUpgradeResponse.success) {
      // Send  Revoke  previous permission and create new access message to Auth service
      let newplatformServiceAccessesForBusiness = await this.subscriptionAccessGenerator.createAccess(subscriptionUpgradeResponse.subscription, SubscriptionType.PLATFORM);
      let newAccessCreateResult = await this.subscriptionBroker.sendAccessRenewalMessageToAuthService(data.businessId, newplatformServiceAccessesForBusiness);
      if (newAccessCreateResult.success) {
        // Sned subscription created event to core service to update business subscriptioni stage
        let sendResult = await this.subscriptionBroker.sendSubscriptionCreatedEventToServices(subscriptionUpgradeResponse)
      }
      console.log("subscritpion status update", newAccessCreateResult)
    }
    return subscriptionUpgradeResponse
  }

  // @Mutation(returns => SubscriptionResponse)
  // async addPlatformServiceToSubscription(@Args("subscriptionId") subscriptionId: string, @Args("platformServiceInfo", { type: () => [CreatePlatformServiceSubscriptionInput] }) serviceInfo: CreatePlatformServiceSubscriptionInput[]): Promise<SubscriptionResponse> {
  //   // add to subscription
  //   let response = await this.subscriptionService.addPlatformServiceToSubscription(subscriptionId, serviceInfo)
  //   if (!response.success) {
  //     return response
  //   }

  //   let data = { ...response.createdSubscription, platformServices: response.addedPlatformServices } as Subscription
  //   let messageInfo = new MessageBrockerMsgBuilder<Subscription>().withData(data).withCoorelationId(AuthServiceMessageType.CREATE_ACCESS_PERMISSION)
  //     .withReplyQueue(AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE).withExpiration(60).withPersistMessage(true).build()
  //   // add access permission
  //   let reply = await this.subscriptionBroker.sendMessageGetReply<SubscriptionPlan, IMessageBrockerResponse<any>>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
  //   if (reply.success) {
  //     return response
  //   }
  //   // update subscription status
  //   return response

  // }


  @Query(returns => [SubscriptionPlan])
  async getBusienssSubscriptionPlans(@Args({ name: "type", type: () => SubscriptionType, nullable: true }) type: SubscriptionType, @Args({ name: "owner", nullable: true }) owner?: string) {
    let queryHelper: QueryHelper<SubscriptionPlan> = {
      query: { type, owner } as SubscriptionPlan
    }
    let result = await this.subscriptionService.getSubscriptions(queryHelper)
    return result;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(AuthzGuard)
  async changeSubscriptionStatus(@Args("subscription") subscriptionId: string, @Args("status") status: boolean) {
    let result = await this.subscriptionService.updateSubscriptionPlanStatus(subscriptionId, status)
    return result;
  }

  @Mutation(returns => SubscriptionResponse)
  async updateSubscriptionPlan(@Args("id") id: string, @Args("data") data: UpdateSubscriptionPlanInput): Promise<SubscriptionResponse> {
    let updatedInfo = data.updateSubscriptionPlanInfo()
    let response = await this.subscriptionService.updateSubscriptionPlanInfo(id, updatedInfo)
    return response
  }

  // @UseGuards(AuthzGuard)
  // @Mutation(returns => SubscriptionResponse)
  // async subscribeToPlan(@Args("info") info: CreatePlatformSubscriptionInput): Promise<SubscriptionResponse> {
  //   let response = await this.subscriptionService.subscribeToPlatformServices(info);
  //   return response
  // }

  @UseGuards(AuthzGuard)
  @Mutation(returns => SubscriptionResponse)
  async deleteSubscriptionPlan(@Args("id") planId: string): Promise<SubscriptionResponse> {
    // delete subscription plan
    // delete associated subscription
    // delete active subscription on business, service, product
    let response = await this.subscriptionService.deleteSubscriptionPlan(planId);
    return response
  }
}
