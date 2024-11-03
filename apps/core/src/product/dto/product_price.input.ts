import { PriceInput } from "@app/common/model/price.model";
import { Field, InputType, PartialType } from "@nestjs/graphql";
import { ArrayNotEmpty, IsNotEmpty } from "class-validator";

@InputType()
export class CreateProductPriceInput {

    @Field()
    branchId?: string

    @Field()
    priceListId?: string

    @Field(types => [PriceInput])
    @ArrayNotEmpty()
    price: PriceInput[]

    @Field()
    isDefault: boolean
}

@InputType()
export class UpdateProductPriceInput extends PartialType(CreateProductPriceInput) {

    @Field()
    id: string
}