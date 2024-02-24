import { Field, InputType, Int, OmitType } from "@nestjs/graphql";
import { SubscriptionPlan } from "../model/subscription_plan.model";
import { SubscriptionType } from "../model/subscription_type.enum";

@InputType()
export class CreateSubscriptionPlanInput extends OmitType(SubscriptionPlan, ["id", "subscriptions", "createdAt", "updatedAt", "isActive"] as const, InputType) {

    getSubscriptionInfo(info: Partial<{ isActiveSubscription: boolean, subscriptionType: SubscriptionType }>) {
        return new SubscriptionPlan({
            benefits: this.benefits,
            category: this.category,
            description: this.description,
            duration: this.duration,
            isActive: info.isActiveSubscription,
            name: this.name,
            owner: this.owner,
            trialPeriod: this.trialPeriod,
            type: info.subscriptionType.toString(),
            price: this.price
        })
    }
}