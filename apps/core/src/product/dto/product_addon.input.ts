import { Field, ID, InputType, OmitType, PartialType } from "@nestjs/graphql";
import { AddonInputType, ProductAddon, ProductAddonOption, ProductAddonOptionInput } from "../model/product_addon.model";
import { Price } from "@app/common/model/price.model";
import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { ArrayNotEmpty, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested, isNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { types } from "joi";


@InputType()
export class CreateProductAddonInput {
    @ArrayNotEmpty()
    @Type(() => LocalizedFieldInput)
    @Field(type => [LocalizedFieldInput])
    name: LocalizedFieldInput[];

    @Field(types => AddonInputType)
    inputType: string;

    @IsOptional()
    @Min(1)
    minAmount?: number;

    @IsOptional()
    @Min(1)
    maxAmount?: number;

    @Field(types => [ProductAddonOptionInput])
    @ValidateIf((obj: CreateProductAddonInput, value) => obj.inputType == AddonInputType.SINGLE_SELECTION_INPUT || obj.inputType == AddonInputType.MULTIPLE_SELECTION_INPUT)
    @ArrayNotEmpty()
    options?: ProductAddonOptionInput[];

    @Field()
    checkCalendar?: boolean;

    isProduct?: boolean;

    @Field()
    isRequired?: boolean;

    tag?: string[];


    @Field(types => [String])
    @ValidateIf((obj: CreateProductAddonInput, value) => obj.isProduct == true)
    @ArrayNotEmpty()
    productIds?: string[];

    @Field(types => [Price])
    @Type(() => Price)
    additionalPrice?: Price[]

    constructor(partial: Partial<CreateProductAddonInput>) {
        Object.assign(this, partial)
    }
}

@InputType()
export class UpdateProductAddonInput extends PartialType(CreateProductAddonInput) {

    @Field(types => ID)
    id: string

    @ValidateIf((obj: CreateProductAddonInput, value) => obj.isProduct == true)
    @IsNotEmpty()
    productId?: string;

    constructor(partial: Partial<UpdateProductAddonInput>) {
        super({ ...partial })
        Object.assign(this, partial)
    }


}