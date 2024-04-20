import { BaseModel } from "@app/common/model/base.model";
import { Directive, Field, Float, ID, InputType, ObjectType } from "@nestjs/graphql";
import { SubscriptionPlan } from "./subscription_plan.model";
import { SubscriptionType } from "./subscription_type.enum";
import { types } from "joi";
import { Access, AccessOwnerType, AppResourceAction, Permission } from "apps/auth/src/authorization/model/access.model";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { includes } from "lodash";
import { PlatformService } from "./platform_service.model";
import { Injectable } from "@nestjs/common";
import { CreateSubscriptionInput } from "../dto/subscription.input";


@ObjectType({ isAbstract: true })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Subscription extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field(type => Date)
    startDate: Date
    @Field(type => Date)
    endDate: Date
    @Field(types => Float, { defaultValue: 0 })
    amountPaid?: number
    @Field()
    subscriptioinPlanId?: string
    @Field()
    isTrialPeriod: boolean
    @Field(type => SubscriptionType)
    type: string
    @Field({ description: "owner of the subscription. it will be a business id for platform service subscription and user id for business subscription" })
    owner?: string
    @Field(type => Date)
    createdAt?: Date
    @Field(type => Date)
    updatedAt: Date

    @Field(type => SubscriptionPlan)
    plan?: SubscriptionPlan

    @Field()
    isActive?: boolean

    @Field(type => [PlatfromServiceSubscription])
    platformServices?: PlatfromServiceSubscription[]

    constructor(data: Partial<Subscription>) {
        super()
        Object.assign(this, data)
    }


    getAllCustomizatioInsideSubscription(): CustomizationInfo[] {
        let result: CustomizationInfo[] = []
        this.platformServices.forEach(service => {
            service.selectedCustomizationInfo.forEach(customization => {
                result.push(customization)
            })
        })
        return result
    }

    getPlatformServiceIdsInSubscription(): string[] {
        return this.platformServices.map(service => service.serviceId)
    }


    changeSubscriptionStatus(status: boolean) {
        this.isActive = status;
    }

    getPlatformServiceAlreadyInSubscriptioin(info: PlatfromServiceSubscription[]): PlatfromServiceSubscription[] {
        let result: PlatfromServiceSubscription[] = []
        var existingPlatformServiceIds = this.platformServices.map(service => service.serviceId);
        let newPlatformServiceIdToAddToSubscription = info.map(service => service.serviceId);
        result = this.platformServices.filter(service => includes(newPlatformServiceIdToAddToSubscription, service.serviceId))
        return result
    }

    getPlatformServicesHavingFreeTier(): string[] {
        return this.platformServices.filter(service => service.isTrialPeriod).map(service => service.serviceId)
    }

}

@InputType()
export class SubscriptionInput extends Subscription { }

@ObjectType({ isAbstract: true })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class PlatfromServiceSubscription {
    @Field(type => ID)
    id?: string
    @Field(type => ID)
    serviceId: string
    @Field()
    serviceName: string
    @Field(type => Date)
    startDate: Date
    @Field(type => Date)
    endDate: Date
    @Field()
    isTrialPeriod?: boolean
    @Field(type => Date)
    createdAt?: Date
    @Field(type => Date)
    updatedAt: Date
    @Field(type => [CustomizationInfo])
    selectedCustomizationInfo: CustomizationInfo[]
}

@InputType()
export class PlatfromServiceSubscriptionInput extends PlatfromServiceSubscription { }

@ObjectType({ isAbstract: true })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class CustomizationInfo {
    @Field(type => ID)
    id?: string

    @Field()
    customizationId: string
    @Field(type => String)
    action: string

    constructor(data: Partial<CustomizationInfo>) {
        Object.assign(this, data)
    }
}

@InputType()
export class CustomizationInfoInput extends CustomizationInfo {

    @Field(type => String)
    action: string | AppResourceAction

    constructor(data: Partial<CustomizationInfoInput>) {
        super({})
        Object.assign(this, data)
    }
}

export interface ISubscriptionInfoBuilder {
    generateBaseSubscription(owner: string, amountPaid: number): ISubscriptionInfoBuilder
}

// write a builder class for subscription data alongside with platform subscription
@Injectable()
export class PlatformSubscriptionBuilder implements ISubscriptionInfoBuilder {
    private subscription: Subscription
    constructor(private allPlatformServices: PlatformService[]) {
        this.subscription = new Subscription({})
    }

    generateBaseSubscription(owner: string, amountPaid: number): PlatformSubscriptionBuilder {
        this.subscription.type = SubscriptionType.PLATFORM
        this.subscription.owner = owner
        this.subscription.amountPaid = amountPaid
        this.subscription.isActive = false
        return this
    }


    addPlatformServices(subscriptionInput: CreateSubscriptionInput) {
        let startDate = new Date(Date.now())
        let serviceSubscriptionInfo = subscriptionInput.selectedPlatformServices.map(selectedServiceInput => {
            let serviceInfo = this.allPlatformServices.find(platformService => platformService.id == selectedServiceInput.serviceId)
            var selectedSubscriptionRenewalInfo = serviceInfo?.subscriptionRenewalInfo.find(info => info.id == selectedServiceInput.selectedRenewalId)
            if (serviceInfo && selectedSubscriptionRenewalInfo) {
                let endDate = new Date(Date.now())
                endDate.setDate(endDate.getDate() + selectedSubscriptionRenewalInfo.duration)
                return <PlatfromServiceSubscription>{
                    serviceId: serviceInfo.id,
                    serviceName: selectedServiceInput.serviceName,
                    selectedCustomizationInfo: selectedServiceInput.selectedCustomizationInfo,
                    startDate: startDate,
                    endDate: endDate,
                    isTrialPeriod: serviceInfo.hasTrialPeriod(selectedSubscriptionRenewalInfo.id)
                }
            }
        })
        this.subscription.platformServices = serviceSubscriptionInfo
        return this
    }

    build() {
        return this.subscription
    }
}