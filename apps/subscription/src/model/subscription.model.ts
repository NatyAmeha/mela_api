import { BaseModel } from "@app/common/model/base.model";
import { Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { SubscriptionPlan } from "./subscription_plan.model";
import { SubscriptionType } from "./subscription_type.enum";
import { types } from "joi";
import { Access, Permission } from "apps/auth/src/authorization/model/access.model";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";


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

    generatePlatformAccessPermissionForBusiness(): Access[] {
        let accesses: Access[] = []
        this.platformServices?.forEach(subscriptionService => {
            var permissions: Permission[] = []
            let serviceLevelPermission = new Permission({ resourceType: subscriptionService.serviceName, resourceTarget: subscriptionService.serviceId, })
            permissions.push(serviceLevelPermission)
            let customizationPermissions = subscriptionService.selectedCustomizationId.map(id => {
                return new Permission({ resourceType: PermissionType.PLATFORM_SERVICE_CUSTOMIZATION_PERMISSION, resourceTarget: id })
            });
            permissions.push(...customizationPermissions)
            var accessInfo = new Access({ permissionType: PermissionType.PLATFORM_PERMISSION, businessId: this.owner, permissions: permissions })
            accesses.push(accessInfo)
        })
        return accesses;
    }

    changeSubscriptionStatus(status: boolean) {
        this.isActive = status;
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