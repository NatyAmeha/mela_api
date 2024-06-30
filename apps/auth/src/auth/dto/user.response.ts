import { Field, ObjectType } from "@nestjs/graphql";

import { User } from "../model/user.model";
import { Access } from "../../authorization/model/access.model";
import { BaseResponse } from "@app/common/model/base.response";

@ObjectType()
export class UserResponse extends BaseResponse {

    @Field(type => User)
    user?: User
    @Field(type => [Access])
    accesses?: Access[]

    constructor(data: Partial<UserResponse>) {
        super()
        Object.assign(this, data)
    }

}


