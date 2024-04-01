import { BaseResponse } from "@app/common/model/base.response";
import { Branch } from "./branch.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../../product/model/product.model";

@ObjectType()
export class BranchResponse extends BaseResponse {
    @Field(type => Branch)
    branch?: Branch;
    @Field(type => [Product])
    products?: Product[]
    @Field(type => [Branch])
    branches?: Branch[];
}