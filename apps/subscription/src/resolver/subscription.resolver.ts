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
import { SubscriptionMessageBrocker } from '../subscription_message_brocker';
import { AppMsgQueues } from 'libs/rmq/constants';
import { IMessageBrocker } from 'libs/rmq/message_brocker';
import { AuthServiceMessageType } from 'libs/rmq/app_message_type';
import { AuthzGuard } from 'libs/common/authorization.guard';
import { CurrentUser } from 'apps/auth/src/auth/service/guard/get_user_decorator';
import { UserInfo } from '@app/common/model/gateway_user.model';
import { IMessageBrockerResponse } from 'libs/rmq/message_brocker.response';
import { Access } from 'apps/auth/src/authorization/model/access.model';
import { SubscriptionHelper } from '../utils/subscription.helper';



@Resolver(of => [SubscriptionResponse, SubscriptionPlan])
export class SubscriptionResolver {
  constructor(
    @Inject(SubscriptionMessageBrocker.InjectName) private subscriptionBroker: SubscriptionMessageBrocker,
    private readonly subscriptionService: SubscriptionService,
    private subscriptionHelper: SubscriptionHelper
  ) { }

  // @UseGuards(AuthzGuard)
  @Mutation(returns => SubscriptionPlan)
  async createPlatformSubscriptionPlan(@Args("plan") plan: CreateSubscriptionPlanInput) {
    var subscriptionInfo = plan.getSubscriptionInfo({ subscriptionType: SubscriptionType.PLATFORM, isActiveSubscription: false })
    var messageInfo: IMessageBrocker<SubscriptionPlan> = {
      data: subscriptionInfo,
      coorelationId: AuthServiceMessageType.PLATFORM_ACCESS_PERMISSION_CREATED,
      replyQueue: AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE,
      expirationInSecond: 60 * 1,
      persistMessage: true,


    }
    var reply = await this.subscriptionBroker.sendMessageGetReply<SubscriptionPlan, number>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
    var result = await this.subscriptionService.createSubscriptionPlan(subscriptionInfo);
    return result;
  }

  @Query(returns => [SubscriptionPlan])
  async getSubscriptionPlans(
    @CurrentUser() data: UserInfo,
    @Args({ name: "type", type: () => SubscriptionType, nullable: true }) type: SubscriptionType,
    @Args({ name: "owner", nullable: true },) owner?: string,
  ) {
    var queryHelper: QueryHelper<SubscriptionPlan> = {
      query: { type, owner } as SubscriptionPlan
    }
    var result = await this.subscriptionService.getSubscriptions(queryHelper)
    return result;
  }

  @Mutation(returns => SubscriptionPlan)
  @UseGuards(AuthzGuard)
  async createBusinessSubscriptionPlan(@Args("plan") plan: CreateSubscriptionPlanInput) {
    var subscriptionInfo = plan.getSubscriptionInfo({ subscriptionType: SubscriptionType.BUSINESS, isActiveSubscription: false })
    var result = await this.subscriptionService.createSubscriptionPlan(subscriptionInfo);
    return result;
  }

  @Mutation(returns => SubscriptionResponse)
  async subscribeToPlatformServices(@Args("input") planInput: CreateSubscriptionInput) {
    // validate the input
    // create subscription info
    var response = await this.subscriptionService.subscribeToPlan(planInput);
    var result = await this.subscriptionBroker.sendSubscriptionCreatedEventToCoreService(response)
    if (!response.success) {
      return response
    }
    // create access permission for business on auth servcie
    var platformAccesses = this.subscriptionHelper.generatePlatformAccessPermissionForBusiness(response.createdSubscription)
    var reply = await this.subscriptionBroker.createPlatformAccessPermission(platformAccesses);
    if (reply.success) {
      var updateResult = await this.subscriptionService.updateSubscriptionStatus(response.createdSubscription!.id!, true)
      response.createdSubscription.isActive = updateResult
      var sendResult = await this.subscriptionBroker.sendSubscriptionCreatedEventToCoreService(response)
      console.log("subscritpion status update", updateResult, sendResult)
    }
    // update subscription status
    return response
  }

  @Mutation(returns => SubscriptionResponse)
  async addPlatformServiceToSubscription(@Args("subscriptionId") subscriptionId: string, @Args("platformServiceInfo", { type: () => [CreatePlatformServiceSubscriptionInput] }) serviceInfo: CreatePlatformServiceSubscriptionInput[]): Promise<SubscriptionResponse> {
    // add to subscription
    var response = await this.subscriptionService.addPlatformServiceToSubscription(subscriptionId, serviceInfo)
    if (!response.success) {
      return response
    }

    var messageInfo: IMessageBrocker<Subscription> = {
      // only send the new platform service info to create access permission
      data: { ...response.createdSubscription, platformServices: response.addedPlatformServices } as Subscription,
      coorelationId: AuthServiceMessageType.CREATE_ACCESS_PERMISSION,
      replyQueue: AppMsgQueues.SUBSCRIPTION_SERVICE_REPLY_QUEUE,
      expirationInSecond: 60 * 1,
      persistMessage: true,
    }
    // add access permission
    var reply = await this.subscriptionBroker.sendMessageGetReply<SubscriptionPlan, IMessageBrockerResponse<any>>(AppMsgQueues.AUTH_SERVICE_REQUEST_QUEUE, messageInfo)
    if (reply.success) {
      return response
    }
    // update subscription status
    return response

  }


  @Query(returns => [SubscriptionPlan])
  async getBusienssSubscriptionPlans(@Args({ name: "type", type: () => SubscriptionType, nullable: true }) type: SubscriptionType, @Args({ name: "owner", nullable: true }) owner?: string) {
    var queryHelper: QueryHelper<SubscriptionPlan> = {
      query: { type, owner } as SubscriptionPlan
    }
    var result = await this.subscriptionService.getSubscriptions(queryHelper)
    return result;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(AuthzGuard)
  async changeSubscriptionStatus(@Args("subscription") subscriptionId: string, @Args("status") status: boolean) {
    var result = await this.subscriptionService.updateSubscriptionPlanStatus(subscriptionId, status)
    return result;
  }

  @Mutation(returns => SubscriptionResponse)
  async updateSubscriptionPlan(@Args("id") id: string, @Args("data") data: UpdateSubscriptionPlanInput): Promise<SubscriptionResponse> {
    var updatedInfo = data.updateSubscriptionPlanInfo()
    var response = await this.subscriptionService.updateSubscriptionPlanInfo(id, updatedInfo)
    return response
  }

  @UseGuards(AuthzGuard)
  @Mutation(returns => SubscriptionResponse)
  async subscribeToPlan(@Args("info") info: CreateSubscriptionInput): Promise<SubscriptionResponse> {
    var response = await this.subscriptionService.subscribeToPlan(info);
    return response
  }

  @UseGuards(AuthzGuard)
  @Mutation(returns => SubscriptionResponse)
  async deleteSubscriptionPlan(@Args("id") planId: string): Promise<SubscriptionResponse> {
    // delete subscription plan
    // delete associated subscription
    // delete active subscription on business, service, product
    var response = await this.subscriptionService.deleteSubscriptionPlan(planId);
    return response
  }
}
