import { BaseResponse } from "@app/common/model/base.response";
import { Staff } from "./staff.model";
import { Field } from "@nestjs/graphql";

export class StaffResponse extends BaseResponse {
    @Field(type => Staff, { nullable: true })
    staff?: Staff;
    staffs?: Staff[];
}