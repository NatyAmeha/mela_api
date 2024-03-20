import { SubscriptionPlan } from "../model/subscription_plan.model";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { Subscription } from "../model/subscription.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { SubscriptionResponse } from "../model/subscription.response";
import { PrismaClient } from '@prisma/client'


export interface ISubscritpionRepository {
    createSubscriptionPlan(subscriptionInfo: SubscriptionPlan): Promise<SubscriptionPlan>
    updateSubscriptionPlanInfo(planId: string, subscriptionInfo: Partial<SubscriptionPlan>): Promise<boolean>
    getPlans(queryInfo: QueryHelper<SubscriptionPlan>): Promise<SubscriptionPlan[]>
    getSubscriptionPlan(planId: string): Promise<SubscriptionPlan>
    deleteSubscriptionPlan(planId: string): Promise<SubscriptionResponse>

    createSubscription(subscriptionInfo: Subscription): Promise<Subscription>
    getSubscriptionInfo(id: string): Promise<Subscription>
    getActiveSubscriptions(planId: string, owner?: string): Promise<Subscription[]>
    updateSubscriptionInfo(id: string, subscriptionInfo: Partial<Subscription>): Promise<boolean>
    isplatformServiceInSubscription(platformServiceId: string[]): Promise<boolean>
}

export class SubscriptionRepository extends PrismaClient implements ISubscritpionRepository, OnModuleInit, OnModuleDestroy {

    static InjectName = "SUBSCRIPTION_PLAN_REPOISTORY"
    async onModuleInit() {
        await this.$connect();
    }

    async createSubscriptionPlan(subscriptionInfo: SubscriptionPlan): Promise<SubscriptionPlan> {
        var createResult = await this.subscriptionPlan.create({ data: { ...subscriptionInfo as any, subscriptions: {} } })
        if (!createResult.id) {
            throw new RequestValidationException({ message: "Unable to create subscription Plan", statusCode: 400 })
        }
        return new SubscriptionPlan({ ...createResult });
    }
    async updateSubscriptionPlanInfo(planId: string, subscriptionInfo: Partial<SubscriptionPlan>): Promise<boolean> {
        var updateResult = await this.subscriptionPlan.update({
            where: { id: planId },
            data: {
                ...subscriptionInfo, subscriptions: {}
            }
        })
        return updateResult.id != undefined
    }

    async getPlans(queryInfo: QueryHelper<SubscriptionPlan>): Promise<SubscriptionPlan[]> {
        var result = await this.subscriptionPlan.findMany({ where: { ...queryInfo.query as any } })
        return result as unknown as SubscriptionPlan[];
    }

    async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan> {
        var result = await this.subscriptionPlan.findFirst({ where: { id: planId } })
        if (!result.id) {
            throw new RequestValidationException({ message: "Unable to find subscritpion plan with this id" })
        }
        return new SubscriptionPlan({ ...result });
    }
    async createSubscription(sub: Subscription): Promise<Subscription> {
        var result = await this.subscription.create({ data: { ...sub as any } })
        if (!result.id) {
            throw new RequestValidationException({ message: "Unable to create subscription", statusCode: 400 })
        }
        return new Subscription({ ...result })
    }

    async getActiveSubscriptions(planId: string, owner?: string): Promise<Subscription[]> {
        var result = await this.subscription.findMany({ where: { subscriptioinPlanId: planId, owner: owner } })
        return result.map(sub => new Subscription({ ...sub }))
    }

    async deleteSubscriptionPlan(planId: string): Promise<SubscriptionResponse> {
        var subscriptionsToDelete: Subscription[] = [];
        subscriptionsToDelete = await this.subscription.findMany({ where: { id: planId } }) as Subscription[]
        var trResult = await this.$transaction(async (tx) => {
            var deletedSubscriptions = await tx.subscriptionPlan.update({
                where: { id: planId },
                data: {
                    subscriptions: {
                        deleteMany: { subscriptioinPlanId: planId }
                    }
                }
            })
            var planToDelete = await tx.subscriptionPlan.delete({ where: { id: planId } })
            var result: SubscriptionResponse = {
                success: true,
                plan: new SubscriptionPlan({ ...planToDelete }),
                deletedSubscritpions: subscriptionsToDelete
            }
            return result;
        })
        return trResult;
    }

    async getSubscriptionInfo(id: string): Promise<Subscription> {
        var result = await this.subscription.findFirst({ where: { id: id } })
        if (!result.id) {
            throw new RequestValidationException({ message: "Unable to find subscritpion Info with this id" })
        }
        return new Subscription({ ...result });
    }

    async updateSubscriptionInfo(id: string, subscriptionInfo: Partial<Subscription>): Promise<boolean> {
        var a = subscriptionInfo.subscriptioinPlanId;
        var updateResult = await this.subscription.update({ where: { id: id }, data: { ...subscriptionInfo } as any })
        return updateResult.id != undefined
    }

    async isplatformServiceInSubscription(platformServiceId: string[]): Promise<boolean> {
        var result = await this.subscription.findFirst({ where: { platformServices: { some: { serviceId: { in: platformServiceId } } } } })
        return result.id != undefined
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }
}