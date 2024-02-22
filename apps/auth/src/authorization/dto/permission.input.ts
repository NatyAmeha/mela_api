import { Field, InputType, OmitType, PartialType } from "@nestjs/graphql";
import { NameType, Permission, PermissionGroup } from "../model/access.model";
import { capitalize } from "lodash";
import { Transform, Type } from "class-transformer";
import { IsEmail, ValidateNested } from "class-validator";

@InputType()
export class CreatePermissionInput {
    @Field()
    @Transform((param) => param.value?.toUpperCase())
    action: string
    @Field()
    @Transform((param) => param.value?.toUpperCase())
    resourceType: string
    @Field()
    @Transform((param) => param.value?.toUpperCase())
    resourceTarget: string
    @Field()
    @Transform((param) => param.value?.toUpperCase())
    effect: string
    @Field(type => [PermissionGroupInput])
    @ValidateNested()
    @Type(() => PermissionGroupInput)
    groups?: PermissionGroupInput[]
}

@InputType()
export class PermissionGroupInput {
    @Field(type => [NameTypeInput])
    @ValidateNested()
    @Type(() => NameTypeInput)
    name: NameTypeInput[]
    @Transform((param) => param.value?.toUpperCase())
    key: string
}

@InputType()
export class NameTypeInput {
    @Field()
    key: string
    @Field()
    value: string
}