import { ArgsType, Field, InputType } from "@nestjs/graphql"
import { IsArray } from "class-validator"

@InputType()
export class AccessArgs {
    @Field()
    user: string
    @Field()
    access?: string
    @Field(type => [String])
    @IsArray()
    accesses?: string[]
    @Field(type => [String])
    @IsArray()
    permissions?: string[]


}