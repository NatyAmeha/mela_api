import { PrismaClient } from "@prisma/client";
import { SubscriptionPlan } from "../model/subscription_plan.model";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";

export interface ISubscriptionPlanRepository {
    createSubscriptionPlan(subscriptionInfo: SubscriptionPlan): Promise<SubscriptionPlan>
    updateSubscriptionInfo(planId: string, subscriptionInfo: Partial<SubscriptionPlan>): Promise<boolean>
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

    async onModuleDestroy() {
        await this.$disconnect()
    }
}