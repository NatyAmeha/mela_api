import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Field, InputType } from "@nestjs/graphql";
import { OrderConfigType } from "../model/order.config.model";
import { Type } from "class-transformer";
import { IsNotEmpty, ValidateIf } from "class-validator";

@InputType()
export class CreateOrderConfigInput {
    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[];
    // @Field(types => OrderConfigType)
    type: string;

    @Field()
    @ValidateIf((obj: CreateOrderConfigInput) => obj.type == OrderConfigType.SINGLE_VALUE)
    @IsNotEmpty()
    singleValue?: string;

    @Field(type => [String])
    @ValidateIf((obj: CreateOrderConfigInput) => obj.type == OrderConfigType.MULTIPLE_VALUE)
    @IsNotEmpty()
    multipleValue?: string[];

    @Field(type => [String])
    @ValidateIf((obj: CreateOrderConfigInput) => obj.type == OrderConfigType.PRODUCT_ID_VALUE)
    @IsNotEmpty()
    productIds?: string[];

    @Field({ defaultValue: 0 })
    additionalPrice: number;

    @Field()
    addonId?: string;
}