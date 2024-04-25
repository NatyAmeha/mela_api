import { BaseModel } from "@app/common/model/base.model";
import { Directive, Field, Float, ID, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty } from "class-validator";
import { LocalizedData, LocalizedFieldInput } from "@app/common/model/localized_model";

@ObjectType({ isAbstract: true })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class SubscriptionRenewalInfo {
    @Field(type => ID)
    id?: string

    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    name: LocalizedData[]

    @Field(type => Int, { defaultValue: 90 })
    duration: number

    @Field(type => Int, { defaultValue: 90 })
    trialPeriod: number

    @Field(type => Int, { defaultValue: 0 })
    discountAmount: number
}

@InputType()
export class SubscriptionRenewalInfoInput extends SubscriptionRenewalInfo {
    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]

    @Field(type => Int, { defaultValue: 90 })
    duration: number

    @Field(type => Int, { defaultValue: 90 })
    trialPeriod: number

    @Field(type => Int, { defaultValue: 0 })
    discountAmount: number
}

@ObjectType({ isAbstract: true })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class PlatformService extends BaseModel {
    @Field(type => ID)
    id?: string

    @Field(type => [LocalizedData])
    name: LocalizedData[]

    @Field(types => PlatformServiceType)
    type: string

    @Field(type => [LocalizedData], { nullable: true })
    description?: LocalizedData[]


    @Field(type => Float)
    basePrice: number

    @Field()
    image?: string

    @Field(type => [LocalizedData])
    features?: LocalizedData[]

    @Field(type => [CustomizationCategory])
    customizationCategories?: CustomizationCategory[]

    @Field(type => [String])
    relatedServicesId?: string[]

    @Field(type => [PlatformService])
    relatedServices?: PlatformService[]




    @Field(type => [SubscriptionRenewalInfo])
    subscriptionRenewalInfo: SubscriptionRenewalInfo[]


    constructor(data: Partial<PlatformService>) {
        super()
        Object.assign(this, data)
    }

    hasTrialPeriod(renewalId: string): boolean {
        let selectedSubscriptionRenewalInfo = this.subscriptionRenewalInfo.find(info => info.id == renewalId)
        if (selectedSubscriptionRenewalInfo && selectedSubscriptionRenewalInfo.trialPeriod > 0) {
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

@InputType()
export class CreatePlatformServiceInput {

    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]

    @Field(type => [LocalizedFieldInput],)
    @Type(() => LocalizedFieldInput)
    description?: LocalizedFieldInput[]

    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    features?: LocalizedFieldInput[]

    @Field(type => Float)
    basePrice: number


    @Field(type => [CustomizationCategoryInput])
    @Type(() => CustomizationCategoryInput)
    customizationCategories?: CustomizationCategoryInput[]


    @Field(type => [SubscriptionRenewalInfoInput])
    @Type(() => SubscriptionRenewalInfoInput)
    @IsNotEmpty()
    @IsArray()
    subscriptionRenewalInfo: SubscriptionRenewalInfoInput[]

    constructor(data: Partial<CreatePlatformServiceInput>) {
        Object.assign(this, data)
    }
}


@ObjectType({ isAbstract: true })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Customization {
    @Field(type => ID)
    id?: string

    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    name: LocalizedData[]

    @Field(type => String)
    actionIdentifier: string

    @Field(type => String)
    value: string

    @Field(type => Float)
    additionalPrice?: number

    default?: boolean
}

@InputType()
export class CustomizationInput extends Customization {
    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]

    @Field(type => String)
    actionIdentifier: string

    @Field(type => String)
    value: string

    @Field(type => Float)
    additionalPrice?: number

    default?: boolean
}

@ObjectType({ isAbstract: true })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class CustomizationCategory {
    @Field(type => ID)
    id?: string

    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    name: LocalizedData[]

    @Field(type => [LocalizedData], { nullable: true })
    @Type(() => LocalizedData)
    description?: LocalizedData[]

    @Field(type => SelectionType)
    selectionType?: string

    selectionRequired?: boolean

    @Field(type => [Customization])
    @Type(() => Customization)
    customizations: Customization[]
}

@InputType()
export class CustomizationCategoryInput extends CustomizationCategory {
    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]

    @Field(type => [LocalizedFieldInput], { nullable: true })
    @Type(() => LocalizedFieldInput)
    description?: LocalizedFieldInput[]

    @Field(type => SelectionType)
    selectionType?: string

    selectionRequired?: boolean

    @Field(type => [CustomizationInput])
    @Type(() => CustomizationInput)
    customizations: CustomizationInput[]
}


export enum SelectionType {
    SINGLE_SELECTION = "SINGLE_SELECTION",
    MULTI_SELECTION = "MULTI_SELECTION"
}

export enum PlatformServiceType {
    POINT_OF_SALE = "POINT_OF_SALE",
    INVENTORY = "INVENTORY",
    ONLINE_STORE = "ONLINE_STORE",
}

registerEnumType(SelectionType, { name: "SelectionType" })
registerEnumType(PlatformServiceType, { name: "PlatformServiceType" })