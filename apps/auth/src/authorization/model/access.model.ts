import { BaseModel } from "@app/common/model/base.model";
import { Field, ID, InputType, ObjectType } from "@nestjs/graphql"; import { User } from "apps/auth/src/auth/model/user.model";
import { CreateAccessInput } from "../dto/access.input";
import { IsArray, IsOptional } from "class-validator";
import { CreatePermissionInput, PermissionGroupInput } from "../dto/permission.input";

@ObjectType()
export class Access extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field()
    resourceId?: string
    @Field()
    role: string
    @Field(type => [Permission])
    permissions?: Permission[]
    @Field()
    userId: string
    @Field(type => User)
    user?: User
    @Field()
    dateCreated?: Date
    @Field()
    dateUpdated?: Date

    constructor(data: Partial<Access>) {
        super()
        Object.assign(this, data)
    }

    static getAccessInfoFromAccessInput(inputs: CreateAccessInput[]): Access[] {
        return inputs.map(input => new Access({
            permissions: input.permissions.map(permissionInput => new Permission({ ...permissionInput, groups: PermissionGroup.getPermissionGroupFromInput(permissionInput.groups) })),
            resourceId: input.resourceId,
            role: input.role
        }))
    }
}

@ObjectType()
export class Permission {
    @Field(type => ID)
    id?: string
    @Field()
    action: string
    @Field()
    resourceType: string
    @Field()
    resourceTarget: string
    @Field()
    effect: string
    @Field(type => [PermissionGroup])
    groups?: PermissionGroup[]
    @Field()
    userGenerated?: boolean

    constructor(data: Partial<Permission>) {
        Object.assign(this, data)
    }

    static getPermissionFromPermissionInput(inputs: CreatePermissionInput[]): Permission[] {
        return inputs.map(input => new Permission({ ...input, groups: PermissionGroup.getPermissionGroupFromInput(input.groups) }))
    }
}

@ObjectType()
export class PermissionGroup {
    @Field()
    id: string
    @Field()
    key: string
    @Field(type => [NameType])
    name: NameType[]
    constructor(data: Partial<PermissionGroup>) {
        Object.assign(this, data)
    }

    static getPermissionGroupFromInput(inputs: PermissionGroupInput[]): PermissionGroup[] {
        return inputs.map(grp => new PermissionGroup({ name: grp.name as NameType[], key: grp.key }))
    }
}

@ObjectType()
export class NameType {
    @Field()
    key: string
    @Field()
    value: string
}