import { Field, InputType, Int, OmitType, PartialType } from "@nestjs/graphql";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { types } from "joi";
import { Type } from "class-transformer";
import { Price, PriceInput } from "@app/common/model/price.model";

@InputType()
export class CreateInventoryInput {
    @Field(types => [PriceInput])
    @Type(() => PriceInput)
    @IsArray()
    priceInfo: PriceInput[];
    @Field()
    @IsNumber()
    @Min(1)
    qty?: number;
    @Field()
    unit?: string;
    @Field(types => Int)
    @IsNumber()
    minOrderQty?: number;

    @Field()
    @IsString()
    inventoryLocationId: string;

    constructor(partial?: Partial<CreateInventoryInput>) {
        Object.assign(this, partial);
    }
}

@InputType()
export class UpdateInventoryInput extends OmitType(CreateInventoryInput, ["inventoryLocationId"] as const,) {
    @Field()
    id: string
    constructor(partial?: Partial<UpdateInventoryInput>) {
        super(partial);
    }
}