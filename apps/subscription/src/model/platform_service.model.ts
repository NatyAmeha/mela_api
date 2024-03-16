import { BaseModel } from "@app/common/model/base.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { Field, Float, ID, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Type } from "class-transformer";

@ObjectType()
@InputType("PlatformServiceInput")
export class PlatformService extends BaseModel {
    @Field(type => ID)
    id?: string

    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    name: LocalizedData[]

    @Field(type => [LocalizedData], { nullable: true })
    @Type(() => LocalizedData)
    description?: LocalizedData[]

    image?: string
    @Field(type => Float)
    basePrice: number

    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    features?: LocalizedData[]

    @Field(type => [CustomizationCategory])
    @Type(() => CustomizationCategory)
    customizationCategories?: CustomizationCategory[]

    @Field(type => [String])
    relatedServicesId?: string[]

    @Field(type => [PlatformService])
    @Type(() => PlatformService)
    relatedServices?: PlatformService[]

    constructor(data: Partial<PlatformService>) {
        super()
        Object.assign(this, data)
    }
}

@ObjectType()
@InputType("CustomizationInput")
export class Customization {
    @Field(type => ID)
    id?: string

    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    name: LocalizedData[]

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

export enum SelectionType {
    SINGLE_SELECTION = "SINGLE_SELECTION",
    MULTI_SELECTION = "MULTI_SELECTION"
}

registerEnumType(SelectionType, { name: "SelectionType" })