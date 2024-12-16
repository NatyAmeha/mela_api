import { Field, ObjectType } from "@nestjs/graphql";

import { User } from "../model/user.model";
import { Access } from "../../authorization/model/access.model";
import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";

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


export class UserResponseBuilder extends BaseResponseBuilder {


    constructor(private userResponse: UserResponse = new UserResponse({})) {
        super(userResponse);

    }


    withUser(user: User): UserResponseBuilder {
        this.userResponse.success = true
        this.userResponse.user = user
        return this;
    }

    build(): UserResponse {
        return this.userResponse
    }
}


