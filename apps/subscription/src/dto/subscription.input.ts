import { Field, InputType, OmitType, PickType } from "@nestjs/graphql";
import { PlatfromServiceSubscription, Subscription } from "../model/subscription.model";
import { SubscriptionPlan } from "../model/subscription_plan.model";
import { gt, isArray, isEmpty, remove } from "lodash";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, IsUUID, ValidateIf, isNotEmpty } from "class-validator";
import { SubscriptionType } from "../model/subscription_type.enum";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { IPlatformServiceRepo } from "../repo/platform_service.repo";

@InputType()
export class CreateSubscriptionInput extends PickType(Subscription, ["owner", "type", "subscriptioinPlanId"] as const, InputType) {

    @Field(type => [CreatePlatformServiceSubscriptionInput])
    @ValidateIf((obj: CreateSubscriptionInput, value) => obj.type != SubscriptionType.PLATFORM)
    @IsNotEmpty()
    selectedPlatformServices?: CreatePlatformServiceSubscriptionInput[]

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

@InputType()
export class CreatePlatformServiceSubscriptionInput extends PickType(PlatfromServiceSubscription, ["serviceId", "serviceName", "selectedCustomizationId"] as const, InputType) {
    @IsString()
    serviceId: string;
    @IsString()
    serviceName: string;
    @IsArray()
    @IsUUID()
    selectedCustomizationId: string[];
    constructor(data: Partial<CreatePlatformServiceSubscriptionInput>) {
        super()
        Object.assign(this, data);
    }

    async generatePlatformServiceSubscriptionInfo(platfromServiceRepo: IPlatformServiceRepo) {
        var serviceInfo = await platfromServiceRepo.getPlatformService(this.serviceId)
        if (serviceInfo) {
            var startDate = new Date(Date.now())
            var endDate = new Date(Date.now())
            endDate.setDate(endDate.getDate() + serviceInfo.duration)
            return <PlatfromServiceSubscription>{
                serviceId: serviceInfo.id,
                serviceName: this.serviceName,
                selectedCustomizationId: this.selectedCustomizationId,
                startDate: startDate,
                endDate: endDate,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
                isTrialPeriod: serviceInfo.hasTrialPeriod()
            }
        }
        else {
            throw new RequestValidationException({ message: `Unable to get Platform service using this id ${this.serviceId}` })
        }
    }
}