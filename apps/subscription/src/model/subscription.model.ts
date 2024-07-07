import { BaseModel } from "@app/common/model/base.model";
import { Directive, Field, Float, ID, InputType, ObjectType } from "@nestjs/graphql";
import { SubscriptionPlan } from "./subscription_plan.model";
import { SubscriptionType } from "./subscription_type.enum";
import { includes, sumBy } from "lodash";
import { PlatformService } from "./platform_service.model";
import { Injectable } from "@nestjs/common";
import { CreatePlatformSubscriptionInput } from "../dto/platform_service_subscription.input";
import { AppResourceAction } from "apps/mela_api/src/const/app_resource.constant";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { Business } from "apps/core/src/business/model/business.model";


@ObjectType()
@Directive('@shareable')
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
    @Field()
    subscribedTo?: string
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

    getPlatformServiceSubscription(platformServiceId: string) {
        return this.platformServices.find(service => service.serviceId == platformServiceId)
    }

    changeSubscriptionStatus(status: boolean) {
        this.isActive = status;
    }

    getPlatformServicesHavingFreeTier(): string[] {
        return this.platformServices.filter(service => service.isTrialPeriod).map(service => service.serviceId)
    }

    isSubscriptionValid() {
        var currentDate = new Date(Date.now())
        return this.endDate > currentDate
    }



    checkSubscriptionValidity() {
        if (!this.isSubscriptionValid()) {
            throw new RequestValidationException({ message: "Subscription Expired" })
        }
    }

    static toSubscriptionInstance(subscriptionObj: Subscription) {
        if (this == undefined) {
            throw new RequestValidationException({ message: "No subscription information found" })
        }
        return new PlatformSubscriptionBuilder().fromSubscriptionObject(subscriptionObj)
    }
}

@ObjectType()
@Directive('@shareable')
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
    @Field({ defaultValue: false })
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

@ObjectType()
@Directive('@shareable')
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

    @Field()
    customizationId: string

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
    constructor(private allPlatformServices?: PlatformService[]) {
        this.subscription = new Subscription({})
    }

    fromSubscriptionObject(subscriptionObj: Subscription) {
        this.subscription = new Subscription({ ...subscriptionObj })
        return this.subscription
    }

    generateBaseSubscription(owner: string): PlatformSubscriptionBuilder {
        this.subscription.type = SubscriptionType.PLATFORM
        this.subscription.owner = owner
        this.subscription.isActive = false
        return this
    }


    addPlatformServices(subscriptionInput: CreatePlatformSubscriptionInput, businessInfo: Business): PlatformSubscriptionBuilder {
        let startDate = new Date(Date.now())
        let serviceSubscriptionInfo = subscriptionInput.selectedPlatformServices.map(selectedServiceInput => {
            let serviceInfo = this.allPlatformServices.find(platformService => platformService.id == selectedServiceInput.serviceId)
            if (!serviceInfo) {
                throw new RequestValidationException({ message: "platform service not found" })
            }
            var selectedSubscriptionRenewalInfo = serviceInfo?.subscriptionRenewalInfo.find(info => info.id == selectedServiceInput.selectedRenewalId)
            if (!selectedSubscriptionRenewalInfo) {
                throw new RequestValidationException({ message: "Subscription renewal info is not set or incorrect" })
            }
            if (serviceInfo && selectedSubscriptionRenewalInfo) {
                let endDate = new Date(Date.now())
                let serviceTrialPeriodAlreadyUsed = includes(businessInfo.trialPeriodUsedServiceIds, serviceInfo.id)
                if (serviceTrialPeriodAlreadyUsed) {
                    endDate.setDate(endDate.getDate() + selectedSubscriptionRenewalInfo.duration)
                }
                else {
                    endDate.setDate(endDate.getDate() + selectedSubscriptionRenewalInfo.trialPeriod)
                }
                return <PlatfromServiceSubscription>{
                    serviceId: serviceInfo.id,
                    serviceName: selectedServiceInput.serviceName,
                    selectedCustomizationInfo: selectedServiceInput.selectedCustomizationInfo,
                    startDate: startDate,
                    endDate: endDate,
                    isTrialPeriod: serviceInfo.hasTrialPeriod(selectedSubscriptionRenewalInfo.id) && !serviceTrialPeriodAlreadyUsed
                }
            }
        })
        this.subscription.platformServices = serviceSubscriptionInfo

        return this
    }

    addTotalAmount(subscriptionInput: CreatePlatformSubscriptionInput, allPlatformServices: PlatformService[]) {
        let platformServiceIdInsideSubscription = subscriptionInput.selectedPlatformServices.map(input => input.serviceId);

        let allCustomizationIdInsideSubscription = subscriptionInput.selectedPlatformServices.map(service => service.selectedCustomizationInfo.map(customization => customization.customizationId)).flat()
        let customizationInsideSubscriptionFullInfo = allPlatformServices.map(service => service.customizationCategories.map(category => category.customizations).flat()).flat().filter(customization => allCustomizationIdInsideSubscription.includes(customization.id))

        let basePrice = sumBy(allPlatformServices, service => service.basePrice);
        let selectedCustomizationPrice = sumBy(customizationInsideSubscriptionFullInfo, customization => customization.additionalPrice)
        let totalAmount = basePrice + selectedCustomizationPrice
        this.subscription.amountPaid = totalAmount
        return this;
    }

    build() {
        return this.subscription
    }
}