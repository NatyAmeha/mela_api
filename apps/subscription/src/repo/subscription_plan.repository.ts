import { PrismaClient } from "@prisma/client";
import { SubscriptionPlan } from "../model/subscription_plan.model";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";

export interface ISubscriptionPlanRepository {
    createSubscriptionPlan(subscriptionInfo: SubscriptionPlan): Promise<SubscriptionPlan>
    updateSubscriptionInfo(planId: string, subscriptionInfo: Partial<SubscriptionPlan>): Promise<boolean>
    getPlans(queryInfo: QueryHelper<SubscriptionPlan>): Promise<SubscriptionPlan[]>
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
        return !updateResult.id
    }

    async getPlans(queryInfo: QueryHelper<SubscriptionPlan>): Promise<SubscriptionPlan[]> {
        var result = await this.subscriptionPlan.findMany({ where: { ...queryInfo.query as any } })
        return result as unknown as SubscriptionPlan[];
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }
}