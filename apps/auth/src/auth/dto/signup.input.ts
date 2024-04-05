import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsOptional, IsPhoneNumber, IsString, } from "class-validator";

@InputType()
export class SignupInput {
    @Field()
    @IsEmail()
    email: string
    @Field()
    @IsString()
    phoneNumber: string
    @Field()
    password?: string
    @Field()
    firstName: string
    @Field()
    lastName?: string
    @Field()
    profileImageUrl?: string


}