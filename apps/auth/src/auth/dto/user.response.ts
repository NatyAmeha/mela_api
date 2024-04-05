import { Field, ObjectType } from "@nestjs/graphql";

import { User } from "../model/user.model";
import { Access } from "../../authorization/model/access.model";

@ObjectType()
export class UserResponse {
    @Field(type => User)
    user?: User
    @Field(type => [Access])
    accesses?: Access[]

}


