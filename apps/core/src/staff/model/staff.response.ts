import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Staff } from "./staff.model";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class StaffResponse extends BaseResponse {
    @Field(type => Staff, { nullable: true })
    staff?: Staff;
    @Field(type => [Staff], { nullable: true })
    staffs?: Staff[];

    constructor(data: Partial<StaffResponse>) {
        super()
        Object.assign(this, data)
    }
}


export class StaffResponseBuilder extends BaseResponseBuilder {
    constructor(private response: StaffResponse = new StaffResponse({})) {
        super(response);
    }

    withStaff(staff: Staff): StaffResponseBuilder {
        this.response.success = true;
        this.response.staff = staff;
        return this;
    }

    withStaffs(staffs: Staff[]): StaffResponseBuilder {
        this.response.success = true;
        this.response.staffs = staffs;
        return this;
    }

    build(): StaffResponse {
        return this.response;
    }
}