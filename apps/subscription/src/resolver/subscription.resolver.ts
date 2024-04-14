import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { SubscriptionService } from '../usecase/subscription.usecase';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionPlan } from '../model/subscription_plan.model';
import { Subscription } from '../model/subscription.model';
import { CreateSubscriptionPlanInput, UpdateSubscriptionPlanInput } from '../dto/subscription_plan.input';
import { SubscriptionType } from '../model/subscription_type.enum';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';
import { CreatePlatformServiceSubscriptionInput, CreateSubscriptionInput } from '../dto/subscription.input';
import { SubscriptionResponse } from '../model/subscription.response';
import { SubscriptionMessageBrocker } from '../msg_brocker_client/subscription_message_brocker';
import { AppMsgQueues } from 'libs/rmq/constants';
import { IMessageBrocker, MessageBrockerMsgBuilder } from 'libs/rmq/message_brocker';
import { AuthServiceMessageType } from 'libs/rmq/app_message_type';
import { AuthzGuard } from 'libs/common/authorization.guard';
import { CurrentUser } from 'libs/common/get_user_decorator';
import { UserInfo } from '@app/common/model/gateway_user.model';
import { IMessageBrockerResponse } from 'libs/rmq/message_brocker.response';
import { Access, AppResources, DefaultRoles } from 'apps/auth/src/authorization/model/access.model';
import { SubscriptionHelper } from '../utils/subscription.helper';
import { IAccessGenerator } from '@app/common/permission_helper/access_factory.interface';
import { SubscriptionAccessGenerator } from '../utils/subscription_access_generator';
import { PermissionSelectionCriteria, RequiresPermission } from '@app/common/permission_helper/require_permission.decorator';
import { PERMISSIONACTION } from '@app/common/permission_helper/permission_constants';
import { PermissionGuard } from '@app/common/permission_helper/permission.guard';
import { SubscriptionUpgradeResponse } from '../model/subscription_upgrade.response';
import { SubscriptionUpgradeInput } from '../dto/update_subscription.input';



@Resolver(of => [SubscriptionResponse, SubscriptionPlan])
export class SubscriptionResolver {
  constructor(
    @Inject(SubscriptionMessageBrocker.InjectName) private subscriptionBroker: SubscriptionMessageBrocker,
    private readonly subscriptionService: SubscriptionService,
    private subscriptionHelper: SubscriptionHelper,
    @Inject(SubscriptionAccessGenerator.injectName) private subscriptionGenerator: IAccessGenerator<Subscription>

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



  @UseGuards(AuthzGuard)
  @RequiresPermission(
    {
      permissions: [
        { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.MANAGE },
        { role: DefaultRoles.BUSINESS_OWNER }
      ],
      selectionCriteria: PermissionSelectionCriteria.ANY
    }
  )
  @UseGuards(PermissionGuard)
  @Mutation(returns => SubscriptionResponse)
  async subscribeBusinessToPlatformServices(@Args("id", { description: "id of the business" }) businessId: string, @Args("input") planInput: CreateSubscriptionInput) {
    // validate the input
    // create subscription info
    let subscritpionResponse = await this.subscriptionService.subscribeToPlan(planInput);
    if (!subscritpionResponse.success) {
      return subscritpionResponse
    }

    // create access permission for business on auth servcie
    let platformServiceAccess = await this.subscriptionGenerator.createAccess(subscritpionResponse.createdSubscription, SubscriptionType.PLATFORM);
    let reply = await this.subscriptionBroker.sendPlatformAccessPermissionMessagetoAuthService(platformServiceAccess);
    if (reply.success) {
      let updateResult = await this.subscriptionService.updateSubscriptionStatus(subscritpionResponse.createdSubscription!.id!, true)
      // subscritpionResponse.changeSubscritpioStatus(updateResult)
      subscritpionResponse.createdSubscription.isActive = updateResult

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

  @Mutation(returns => SubscriptionResponse)
  async renewBusienssPlatformSubscription(@Args("id") id: string, @Args("subscriptionUpdateInfo") data: SubscriptionUpgradeInput): Promise<SubscriptionResponse> {
    let subscriptionUpgradeResponse = await this.subscriptionService.renewSubscription(id, data);
    if (subscriptionUpgradeResponse.success) {
      //Send  Revoke  previous permission and create new access message to Auth service
      let newplatformServiceAccessesForBusiness = await this.subscriptionGenerator.createAccess(subscriptionUpgradeResponse.createdSubscription, SubscriptionType.PLATFORM);
      let newAccessCreateResult = await this.subscriptionBroker.sendRevokePreviousPlatformAccessPermissionAndCreateNewAccessToAuthService(data.businessId, newplatformServiceAccessesForBusiness);
      if (newAccessCreateResult.success) {
        // Sned subscription created event to core service to update business subscriptioni stage
        let sendResult = await this.subscriptionBroker.sendSubscriptionCreatedEventToServices(subscriptionUpgradeResponse)
      }
      console.log("subscritpion status update", newAccessCreateResult, subscriptionUpgradeResponse)
    }
    return subscriptionUpgradeResponse
  }

  @Mutation(returns => SubscriptionResponse)
  async addPlatformServiceToSubscription(@Args("subscriptionId") subscriptionId: string, @Args("platformServiceInfo", { type: () => [CreatePlatformServiceSubscriptionInput] }) serviceInfo: CreatePlatformServiceSubscriptionInput[]): Promise<SubscriptionResponse> {
    // add to subscription
    let response = await this.subscriptionService.addPlatformServiceToSubscription(subscriptionId, serviceInfo)
    if (!response.success) {
      return response
    }

    let data = { ...response.createdSubscription, platformServices: response.addedPlatformServices } as Subscription
    let messageInfo = new MessageBrockerMsgBuilder<Subscription>().withData(data).withCoorelationId(AuthServiceMessageType.CREATE_ACCESS_PERMISSION)
      .withReplyQueue(AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE).withExpiration(60).withPersistMessage(true).build()
    // add access permission
    let reply = await this.subscriptionBroker.sendMessageGetReply<SubscriptionPlan, IMessageBrockerResponse<any>>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
    if (reply.success) {
      return response
    }
    // update subscription status
    return response

  }


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

  @UseGuards(AuthzGuard)
  @Mutation(returns => SubscriptionResponse)
  async subscribeToPlan(@Args("info") info: CreateSubscriptionInput): Promise<SubscriptionResponse> {
    let response = await this.subscriptionService.subscribeToPlan(info);
    return response
  }

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
