import { Field, ID, InputType, OmitType, PartialType } from "@nestjs/graphql";
import { ProductAddon } from "../model/product_addon.model";
import { Price } from "@app/common/model/price.model";
import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { ArrayNotEmpty, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateIf, ValidateNested, isNotEmpty } from "class-validator";
import { Type } from "class-transformer";


@InputType()
export class CreateProductAddonInput {
    @ArrayNotEmpty()
    @Type(() => LocalizedFieldInput)
    @Field(type => [LocalizedFieldInput])
    name: LocalizedFieldInput[];

    @Min(1)
    @IsOptional()
    minQty?: number;
    @IsOptional()
    @Min(1)
    maxQty?: number;

    isProduct?: boolean;

    isRequired?: boolean;

    tag?: string[];


    @ValidateIf((obj: CreateProductAddonInput, value) => obj.isProduct == true)
    @IsNotEmpty()
    productId?: string;

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