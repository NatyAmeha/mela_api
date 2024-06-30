import { Field, InputType, OmitType, PartialType } from "@nestjs/graphql";
import { Permission, PermissionGroup } from "../model/access.model";
import { capitalize } from "lodash";
import { Transform, Type } from "class-transformer";
import { IsEmail, ValidateNested } from "class-validator";
import { LocalizedFieldInput } from "@app/common/model/localized_model";

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
    @Field(type => [LocalizedFieldInput])
    @ValidateNested()
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[]
    @Transform((param) => param.value?.toUpperCase())
    key: string
}