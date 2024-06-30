import { Field, Float, InputType, Int, OmitType, PartialType, } from "@nestjs/graphql";
import { BenefitInfo, BenefitInfoInput, SubscriptionPlan } from "../model/subscription_plan.model";
import { SubscriptionType } from "../model/subscription_type.enum";
import { isNil, omitBy } from "lodash";

import { IsNotEmpty, IsNumber, isNotEmpty } from "class-validator";
import { Transform, Type } from "class-transformer";
import { LocalizedFieldInput } from "@app/common/model/localized_model";


@InputType()
export class CreateSubscriptionPlanInput {
    @Field(type => [BenefitInfoInput])
    @IsNotEmpty()
    @Type(() => BenefitInfoInput)
    benefits: BenefitInfoInput[];

    @IsNotEmpty()
    @Transform((param) => (param.value as string[]).map(e => e.toUpperCase()))
    category: string[];

    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    description?: LocalizedFieldInput[];

    @Field(type => [LocalizedFieldInput])
    @IsNotEmpty()
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[];

    @IsNumber()
    price: number;

    @Field(type => SubscriptionType, { description: "PLATFORM, BUSEINSS, PRODUCT, SERVICE" })
    @IsNotEmpty()
    type: string;

    @IsNumber()
    trialPeriod: number;
    owner?: string;
    @IsNumber()
    duration: number;
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


@InputType()
export class UpdateSubscriptionPlanInput extends PartialType(CreateSubscriptionPlanInput, InputType) {

    updateSubscriptionPlanInfo() {
        var info = <SubscriptionPlan>{
            benefits: this.benefits,
            category: this.category,
            description: this.description,
            duration: this.duration,
            name: this.name,
            trialPeriod: this.trialPeriod,
            price: this.price,
            updatedAt: new Date(Date.now())
        }
        var subscriptionInfo = omitBy(info, u => isNil(u))
        return new SubscriptionPlan({ ...subscriptionInfo })
    }
}