import { Field, Float, ID, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql"
import { BaseModel } from "@app/common/base.model"
import { Subscription } from "./subscription.model"
import { SubscriptionType } from "./subscription_type.enum"
import { Transform, Type } from "class-transformer"
import { IsNotEmpty, IsNumber, ValidateIf, isNotEmpty, } from "class-validator"
import { LocalizedData } from "@app/common/model/localized_model"

@ObjectType()
@InputType("SubscriptionPlanInput")
export class SubscriptionPlan extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    name: LocalizedData[]
    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    description?: LocalizedData[]
    @Field(type => Float)
    @IsNumber()
    price: number
    @Field(type => [String])
    @IsNotEmpty()
    @Transform((param) => (param.value as string[]).map(e => e.toUpperCase()))
    category: string[]
    @Field(type => [BenefitInfo])
    @IsNotEmpty()
    @Type(() => BenefitInfo)
    benefits: BenefitInfo[]
    @Field(type => Int)
    @IsNumber()
    duration: number
    @Field(type => Int)
    @IsNumber()
    trialPeriod?: number
    @Field(type => SubscriptionType, { description: "PLATFORM, BUSEINSS, PRODUCT, SERVICE" })
    type: string
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

@ObjectType()
@InputType("BenefitInput")
export class BenefitInfo {
    @Field(type => [String])
    tags?: string[]
    @Field(type => [LocalizedData])
    @Type(() => LocalizedData)
    descriptions: LocalizedData[]
}



