import { BaseModel } from "@app/common/model/base.model";


import { Field, Float, ID, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { SubscriptionLocalizedField } from "../utils/subscriptioni_localized_field.model";


@ObjectType()
@InputType("PlatformServiceInput")
export class PlatformService extends BaseModel {
    @Field(type => ID)
    id?: string

    @Field(type => [SubscriptionLocalizedField])
    @Type(() => SubscriptionLocalizedField)
    name: SubscriptionLocalizedField[]

    @Field(type => [SubscriptionLocalizedField], { nullable: true })
    @Type(() => SubscriptionLocalizedField)
    description?: SubscriptionLocalizedField[]

    @Field()
    image?: string
    @Field(type => Float)
    basePrice: number

    @Field(type => [SubscriptionLocalizedField])
    @Type(() => SubscriptionLocalizedField)
    features?: SubscriptionLocalizedField[]

    @Field(type => [CustomizationCategory])
    @Type(() => CustomizationCategory)
    customizationCategories?: CustomizationCategory[]

    @Field(type => [String])
    relatedServicesId?: string[]

    @Field(type => [PlatformService])
    @Type(() => PlatformService)
    relatedServices?: PlatformService[]

    @Field(type => Int)
    trialPeriod?: number
    @Field(type => Int)
    duration?: number = 90

    constructor(data: Partial<PlatformService>) {
        super()
        Object.assign(this, data)
    }

    hasTrialPeriod() {
        if (this.trialPeriod && this.trialPeriod > 0) {
            return true
        }
        return false
    }

    getDefaultCustomization(): string[] {
        var result: string[] = []
        this.customizationCategories.forEach(cc => {
            var defaultcustomzationId = cc.customizations.filter(customzation => customzation.default == true).map(cust => cust.id);
            result.push(...defaultcustomzationId)
        });
        return result;
    }
}

@ObjectType()
@InputType("CustomizationInput")
export class Customization {
    @Field(type => ID)
    id?: string

    @Field(type => [SubscriptionLocalizedField])
    @Type(() => SubscriptionLocalizedField)
    name: SubscriptionLocalizedField[]

    @Field(type => String)
    value: string

    @Field(type => Float)
    additionalPrice?: number

    default?: boolean
}

@ObjectType()
@InputType("CustomizationCategoryInput")
export class CustomizationCategory {
    @Field(type => ID)
    id?: string

    @Field(type => [SubscriptionLocalizedField])
    @Type(() => SubscriptionLocalizedField)
    name: SubscriptionLocalizedField[]

    @Field(type => [SubscriptionLocalizedField], { nullable: true })
    @Type(() => SubscriptionLocalizedField)
    description?: SubscriptionLocalizedField[]

    @Field(type => SelectionType)
    selectionType?: string

    selectionRequired?: boolean

    @Field(type => [Customization])
    @Type(() => Customization)
    customizations: Customization[]
}

export enum SelectionType {
    SINGLE_SELECTION = "SINGLE_SELECTION",
    MULTI_SELECTION = "MULTI_SELECTION"
}

registerEnumType(SelectionType, { name: "SelectionType" })