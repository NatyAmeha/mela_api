import { Field, InputType } from "@nestjs/graphql";
import { Subscription, CustomizationInfoInput } from "../model/subscription.model";
import { SubscriptionPlan } from "../model/subscription_plan.model";
import { gt } from "lodash";
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

export interface SubscriptionInput {

}

@InputType()
export class CreatePlatformSubscriptionInput implements SubscriptionInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    owner: string;

    @Field(type => [SelectedPlatformServiceForSubscription])
    @IsNotEmpty()
    selectedPlatformServices?: SelectedPlatformServiceForSubscription[]

    constructor(data: Partial<CreatePlatformSubscriptionInput>) {
        Object.assign(this, data)
    }



}
@InputType()
export class SelectedPlatformServiceForSubscription {
    @Field()
    @IsString()
    serviceId: string;

    @Field()
    @IsString()
    serviceName: string;

    @Field(type => [CustomizationInfoInput])
    @IsArray()
    @IsNotEmpty()
    @IsUUID()
    selectedCustomizationInfo: CustomizationInfoInput[];

    @Field()
    selectedRenewalId: string;
    constructor(data: Partial<SelectedPlatformServiceForSubscription>) {
        Object.assign(this, data);
    }

    // async generatePlatformServiceSubscriptionInfo(platfromServiceRepo: IPlatformServiceRepo) {
    //     var serviceInfo = await platfromServiceRepo.getPlatformService(this.serviceId)
    //     var selectedSubscriptionRenewalInfo = serviceInfo?.subscriptionRenewalInfo.find(info => info.id == this.renewalId)
    //     if (serviceInfo) {
    //         var startDate = new Date(Date.now())
    //         var endDate = new Date(Date.now())
    //         endDate.setDate(endDate.getDate() + selectedSubscriptionRenewalInfo.duration)
    //         return <PlatfromServiceSubscription>{
    //             serviceId: serviceInfo.id,
    //             serviceName: this.serviceName,
    //             selectedCustomizationId: this.selectedCustomizationId,
    //             startDate: startDate,
    //             endDate: endDate,
    //             isTrialPeriod: serviceInfo.hasTrialPeriod()
    //         }
    //     }
    //     else {
    //         throw new RequestValidationException({ message: `Unable to get Platform service using this id ${this.serviceId}` })
    //     }
    // }
}

@InputType()
export class UpdatePlatformSubscriptionInput {
    @Field()
    @IsUUID()
    serviceId: string;

    @Field(types => [CustomizationInfoInput])
    @IsArray()
    @IsUUID()
    selectedCustomizationInfo?: CustomizationInfoInput[];
    constructor(data: Partial<UpdatePlatformSubscriptionInput>) {
        Object.assign(this, data)
    }
}