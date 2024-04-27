import { BaseResponse } from "@app/common/model/base.response";
import { Branch } from "./branch.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../../product/model/product.model";

@ObjectType()
export class BranchResponse extends BaseResponse {
    @Field(types => Branch)
    branch?: Branch;
    @Field(types => [Product])
    products?: Product[]
    @Field(types => [Branch])
    branches?: Branch[];
}