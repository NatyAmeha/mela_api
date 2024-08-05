import { LocalizedFieldInput } from "@app/common/model/localized_model"
import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql"
import { Type } from "class-transformer"
import { ArrayNotEmpty, IsNotEmpty } from "class-validator"
@InputType()
export class CreatePriceListInput {
    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @ArrayNotEmpty()
    @IsNotEmpty()
    name: LocalizedFieldInput[]

    @Field(types => [LocalizedFieldInput])
    @IsNotEmpty()
    description?: LocalizedFieldInput[]

    @Field(types => [String])
    branchIds?: string[]

    @Field({ defaultValue: true })
    isActive?: boolean
}

@InputType()
export class UpdatePriceListInput extends PartialType(CreatePriceListInput) {
    @Field()
    id: string
}