import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "./user.model";

@ObjectType()
export class AuthResponse {
    @Field(type => User)
    user?: User
    @Field()
    accessToken?: string
    @Field()
    refreshToken?: string
}