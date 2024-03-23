import { InputType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { Product, ProductType } from "../model/product.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";
import { Transform, Type } from "class-transformer";

@InputType()
export class CreateProductInput extends OmitType(Product, ['id', 'branches', 'business', 'createdAt', 'isActive', 'updatedAt'] as const, InputType) {
    @IsNotEmpty()
    @Type(() => LocalizedData)
    name: LocalizedData[];

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsArray()
    @Transform(param => param.value.map(v => v.toUpperCase()))
    tag?: string[];

    @IsArray()
    @Transform(param => param.value.map(v => v.toUpperCase()))
    category: string[];

    toProduct(): Product {
        var product = new Product({ ...this });
        return product;
    }
}

@InputType()
export class UpdateProductInput extends PartialType(OmitType(CreateProductInput, ['businessId', 'branchIds'] as const, InputType)) {

    getProductInfoToBeUpdated(): Product {
        return new Product({ ...this });
    }
}