import { Args, ArgsType, Field, InputType, OmitType } from "@nestjs/graphql";
import { Permission } from "../model/access.model";
import { IsArray, IsEmail, IsOptional, IsPhoneNumber, ValidateNested } from "class-validator";
import { CreatePermissionInput } from "./permission.input";
import { Transform } from "class-transformer";

@InputType()
@ArgsType()
export class CreateAccessInput {
    @Field()
    @IsEmail()
    // @Transform((param) => {
    //     var a = param.value?.toUpperCase()
    //     console.log(a, param)
    //     return a;
    // })
    role: string
    @Field(type => [CreatePermissionInput])
    @ValidateNested()
    permissions: CreatePermissionInput[]
    @Field()
    @IsOptional()
    resourceId?: string
}



