import { BaseResponse } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Business } from "./business.model";
import { Branch } from "../../branch/model/branch.model";
import { Product } from "../../product/model/product.model";
import { Access } from "apps/auth/src/authorization/model/access.model";

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

    accesses?: Access[]

    constructor(data: Partial<BusinessResponse>) {
        super()
        Object.assign(this, data)
    }

}