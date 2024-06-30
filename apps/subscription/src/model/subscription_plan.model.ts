import { Directive, Field, Float, ID, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql"
import { BaseModel } from "@app/common/model/base.model"
import { Subscription } from "./subscription.model"
import { SubscriptionType } from "./subscription_type.enum"
import { Transform, Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, ValidateIf, isNotEmpty, } from "class-validator"
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model"


@ObjectType({ isAbstract: true })
@Directive('@extends')
@Directive('@key(fields: "id")')
export class SubscriptionPlan extends BaseModel {
    @Field(type => ID)
    id?: string

    @Field(type => [LocalizedField])
    name?: LocalizedField[]

    @Field(type => [LocalizedField])
    description?: LocalizedField[]

    @Field(type => Float)
    price?: number
    @Field(type => [String])
    category?: string[]
    @Field(type => [BenefitInfo])
    benefits?: BenefitInfo[]
    @Field(type => Int)
    duration?: number
    @Field(type => Int)
    trialPeriod?: number
    @Field(type => SubscriptionType, { description: "PLATFORM, BUSEINSS, PRODUCT, SERVICE" })
    type?: string
    @Field()
    @ValidateIf((obj: SubscriptionPlan, value) => obj.type != SubscriptionType.PLATFORM)
    @IsNotEmpty()
    owner?: string
    @Field()
    isActive?: boolean
    @Field(type => Date)
    createdAt?: Date
    @Field(type => Date)
    updatedAt?: Date

    @Field(type => [Subscription])
    subscriptions?: Subscription[]

    constructor(data: Partial<SubscriptionPlan>) {
        super()
        Object.assign(this, data)
    }
}


@ObjectType({ isAbstract: true })
@Directive('@extends')
// @Directive('@key(fields: "id")')
export class BenefitInfo {
    @Field(type => [String])
    tags?: string[]
    @Field(type => [LocalizedField])
    @Type(() => LocalizedField)
    descriptions: LocalizedField[]
}

@InputType()
export class BenefitInfoInput {
    @Field(type => [String])
    tags?: string[]
    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    descriptions: LocalizedFieldInput[]
}



