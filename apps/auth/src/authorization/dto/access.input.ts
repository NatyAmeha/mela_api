import { Args, ArgsType, Field, InputType, OmitType } from "@nestjs/graphql";
import { Permission } from "../model/access.model";
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, ValidateNested } from "class-validator";
import { CreatePermissionInput } from "./permission.input";
import { Transform, Type } from "class-transformer";

@InputType()
export class CreateAccessInput {
    @Field()
    role: string
    @Field(type => [CreatePermissionInput])
    @ValidateNested({ always: true, each: true })
    @Type(() => CreatePermissionInput)
    @IsNotEmpty()
    @IsArray()
    permissions: CreatePermissionInput[]
    @Field()
    @IsOptional()
    resourceId?: string
}



