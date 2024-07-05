import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { PriceInput } from "@app/common/model/price.model";
import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { MembershipPerkType, MembershipType } from "../model/memberhip.model";
import { ArrayNotEmpty } from "class-validator";

@InputType()
export class CreateMembershipInput {
    @Field(type => [LocalizedFieldInput])
    @ArrayNotEmpty()
    name: LocalizedFieldInput[]

    @Field(type => [LocalizedFieldInput])
    @ArrayNotEmpty()
    description?: LocalizedFieldInput[]

    @Field(type => [BenefitInput])
    @ArrayNotEmpty()
    benefits: BenefitInput[]

    @Field(type => [PriceInput])
    @ArrayNotEmpty()
    price: PriceInput[]

    @Field(type => [String])
    category?: string[]

    @Field(type => Int)
    duration: number

    @Field(type => MembershipType)
    type: string

    @Field({ defaultValue: true })
    isActive?: boolean
}



@InputType()
export class BenefitInput {
    @Field(type => [LocalizedFieldInput])
    name: LocalizedFieldInput[]
    @Field(type => MembershipPerkType)
    perkType?: string
}