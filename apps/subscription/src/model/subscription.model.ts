import { BaseModel } from "@app/common/model/base.model";
import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { SubscriptionPlan } from "./subscription_plan.model";
import { SubscriptionType } from "./subscription_type.enum";
import { types } from "joi";
import { Access, AccessOwnerType, Permission } from "apps/auth/src/authorization/model/access.model";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { includes } from "lodash";


@ObjectType()
@InputType("SubscriptionInput")
export class Subscription extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field(type => Date)
    startDate: Date
    @Field(type => Date)
    endDate: Date
    @Field()
    subscriptioinPlanId?: string
    @Field()
    isTrialPeriod: boolean
    @Field(type => SubscriptionType)
    type: string
    @Field({ description: "owner can be business id, service id, product id" })
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

@ObjectType()
@InputType("PlatformServiceSubscriptionInput")
export class PlatfromServiceSubscription {
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
    @Field(type => [String])
    selectedCustomizationId: string[]
}