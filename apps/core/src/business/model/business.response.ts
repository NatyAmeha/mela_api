import { BaseResponse } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Business } from "./business.model";
import { Branch } from "../../branch/model/branch.model";
import { Product } from "../../product/model/product.model";

@ObjectType()
export class BusinessResponse extends BaseResponse {
    @Field(type => Business)
    business?: Business;
    @Field(type => [Product])
    products?: Product[]
    @Field(type => [Branch])
    branches?: Branch[]
    branchAdded?: Branch[]
    branchUpdated?: Branch[]

}