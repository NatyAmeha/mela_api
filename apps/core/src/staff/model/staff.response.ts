import { BaseResponse } from "@app/common/model/base.response";
import { Staff } from "./staff.model";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class StaffResponse extends BaseResponse {
    @Field(type => Staff, { nullable: true })
    staff?: Staff;
    @Field(type => [Staff], { nullable: true })
    staffs?: Staff[];
}