import { PrismaClient } from "@prisma/client";
import { SubscriptionPlan } from "../model/subscription_plan.model";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { Subscription } from "../model/subscription.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

export interface ISubscriptionPlanRepository {
    createSubscriptionPlan(subscriptionInfo: SubscriptionPlan): Promise<SubscriptionPlan>
    updateSubscriptionInfo(planId: string, subscriptionInfo: Partial<SubscriptionPlan>): Promise<boolean>
    getPlans(queryInfo: QueryHelper<SubscriptionPlan>): Promise<SubscriptionPlan[]>
    getSubscriptionPlan(planId: string): Promise<SubscriptionPlan>
    createSubscription(subscriptionInfo: Subscription): Promise<Subscription>
}

export class SubscriptionPlanRepository extends PrismaClient implements ISubscriptionPlanRepository, OnModuleInit, OnModuleDestroy {
    static InjectName = "SUBSCRIPTION_PLAN_REPOISTORY"
    async onModuleInit() {
        await this.$connect();
    }

    async createSubscriptionPlan(subscriptionInfo: SubscriptionPlan): Promise<SubscriptionPlan> {
        var createResult = await this.subscriptionPlan.create({ data: { ...subscriptionInfo, subscriptions: {} } })
        return new SubscriptionPlan({ ...createResult });
    }
    async updateSubscriptionInfo(planId: string, subscriptionInfo: Partial<SubscriptionPlan>): Promise<boolean> {
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
        return new Subscription({ ...result })
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }
}