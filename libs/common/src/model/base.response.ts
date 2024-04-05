import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class BaseResponse {
    @Field()
    success: boolean
    @Field(type => String)
    message?: string
    @Field(type => Int)
    code?: number
} 