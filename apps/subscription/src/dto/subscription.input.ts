import { InputType, OmitType, PickType } from "@nestjs/graphql";
import { Subscription } from "../model/subscription.model";
import { SubscriptionPlan } from "../model/subscription_plan.model";
import { gt } from "lodash";

@InputType()
export class CreateSubscriptionInput extends PickType(Subscription, ["owner", "subscriptioinPlanId"] as const, InputType) {

    getSubscriptionInfoFromPlan(plan: SubscriptionPlan): Subscription {
        var startDate = new Date(Date.now())
        var endDate = new Date(Date.now())
        endDate.setDate(endDate.getDate() + plan.duration)
        return new Subscription({
            isTrialPeriod: gt(plan.trialPeriod, 0),
            type: plan.type,
            subscriptioinPlanId: plan.id,
            owner: this.owner,
            startDate: startDate,
            endDate: endDate,
            createdAt: startDate,
            updatedAt: startDate,
        })
    }
}