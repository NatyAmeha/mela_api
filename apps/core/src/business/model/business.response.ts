import { BaseResponse } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Business } from "./business.model";
import { Branch } from "../../branch/model/branch.model";

@ObjectType()
export class BusinessResponse extends BaseResponse {
    @Field(type => Business)
    business?: Business;
    branchAdded?: Branch[]
    branchUpdated?: Branch[]

}