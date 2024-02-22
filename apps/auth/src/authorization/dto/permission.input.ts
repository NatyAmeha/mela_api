import { Field, InputType, OmitType, PartialType } from "@nestjs/graphql";
import { NameType, Permission, PermissionGroup } from "../model/access.model";
import { capitalize } from "lodash";
import { Transform } from "class-transformer";

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

    groups?: PermissionGroupInput[]
}

@InputType()
export class PermissionGroupInput {
    @Field(type => [NameTypeInput])
    name: NameTypeInput[]
}

@InputType()
export class NameTypeInput {
    @Field()
    key: string
    @Field()
    value: string
}