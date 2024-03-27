import { Field } from "@nestjs/graphql";
import { Access } from "./access.model";
import { BaseResponse } from "@app/common/model/base.response";

export class AccessResponse extends BaseResponse {
    @Field(type => [Access])
    accesses?: Access[]
}