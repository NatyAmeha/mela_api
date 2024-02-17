import { Field, ObjectType } from "@nestjs/graphql";

import { User } from "../model/user.model";

@ObjectType()
export class UserResponse {
    @Field(type => User)
    user?: User
    @Field()
    token?: string
}


