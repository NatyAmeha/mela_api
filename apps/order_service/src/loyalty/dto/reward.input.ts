import { LocalizedFieldInput } from "@app/common/model/localized_model"
import { Field, Float, InputType } from "@nestjs/graphql"
import { Type } from "class-transformer"
import { IsEnum, IsNumber } from "class-validator"


export enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    AMOUNT = "AMOUNT"
}

@InputType()
export class CreateRewardInput {
    @Type(() => LocalizedFieldInput)
    @Field(type => [LocalizedFieldInput])
    name: LocalizedFieldInput[]

    @Type(() => LocalizedFieldInput)
    @Field(type => [LocalizedFieldInput])
    description: LocalizedFieldInput[]

    @Field(type => [LocalizedFieldInput])
    conditions: LocalizedFieldInput[]

    @IsNumber()
    @Field(type => Float)
    minPointsToRedeem: number

    @IsEnum(DiscountType)
    @Field(type => String)
    discountType?: string

    @IsNumber()
    @Field(type => Float)
    discountAmount?: number


    constructor(partial?: Partial<CreateRewardInput>) {
        Object.assign(this, partial);
    }
}