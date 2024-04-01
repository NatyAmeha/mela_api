import { BaseResponse } from "@app/common/model/base.response";
import { Product } from "./product.model";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProductResponse extends BaseResponse {
    @Field(type => Product)
    product?: Product;
    @Field(type => [Product])
    products?: Product[];
}