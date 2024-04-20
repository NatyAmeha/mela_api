import { InputType, OmitType, PartialType } from "@nestjs/graphql";
import { Product, ProductInput } from "../model/product.model";


@InputType()
export class UpdateProductInput extends PartialType(OmitType(ProductInput, ['businessId', 'branchIds'] as const, InputType)) {

    getProductInfoToBeUpdated(): Product {
        return new Product({ ...this });
    }
}