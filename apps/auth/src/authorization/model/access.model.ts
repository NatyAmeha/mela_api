import { BaseModel } from "@app/common/model/base.model";
import { Directive, Field, ID, InputType, ObjectType, PartialType, PickType, registerEnumType } from "@nestjs/graphql"; import { User } from "apps/auth/src/auth/model/user.model";
import { CreateAccessInput } from "../dto/access.input";
import { IsArray, IsOptional } from "class-validator";
import { CreatePermissionInput, PermissionGroupInput } from "../dto/permission.input";
import { PermissionType } from "./permission_type.enum";
import { PERMISSIONACTION, PermissionEffectType, PermissionResourceType } from "@app/common/permission_helper/permission_constants";
import { LocalizedData } from "@app/common/model/localized_model";


@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id name{key,value} resourceId role permissions{action,resourceType,resourceTarget,effect,groups{id,key,name{key,value}}} owner ownerType dateCreated dateUpdated permissionType")')
export class Access extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field(type => [LocalizedData])
    name?: LocalizedData[]
    @Field()
    resourceId?: string
    @Field()
    role?: string
    @Field(type => [Permission])
    permissions?: Permission[]
    @Field()
    owner: string
    @Field(types => AccessOwnerType)
    ownerType: string
    @Field()
    dateCreated?: Date
    @Field()
    dateUpdated?: Date
    @Field(type => PermissionType)
    permissionType: string

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
@Directive('@extends')
@Directive('@key(fields: "id name{key,value} action resourceType resourceTarget effect groups{id,key,name{key,value}} userGenerated")')
export class Permission {
    @Field(types => ID)
    id?: string
    @Field(types => [LocalizedData])
    name?: LocalizedData[]
    @Field()
    action: string = PERMISSIONACTION.ANY.toString()
    @Field()
    resourceType: string = PermissionResourceType.ANY.toString()
    @Field()
    resourceTarget: string
    @Field()
    effect: string = PermissionEffectType.ALLOW
    @Field(type => [PermissionGroup])
    groups?: PermissionGroup[]
    @Field()
    userGenerated?: boolean = false


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
    @Field(type => [LocalizedData])
    name: LocalizedData[]
    constructor(data: Partial<PermissionGroup>) {
        Object.assign(this, data)
    }

    static getPermissionGroupFromInput(inputs: PermissionGroupInput[]): PermissionGroup[] {
        return inputs.map(grp => new PermissionGroup({ name: grp.name as LocalizedData[], key: grp.key }))
    }
}

export enum AccessOwnerType {
    USER = 'USER',
    BUSINESS = 'BUSINESS',
    PLATFORM = 'PLATFORM'
}
registerEnumType(AccessOwnerType, { name: 'AccessOwnerType' })



export enum DefaultRoles {
    ADMIN = 'ADMIN',
    BUSINESS_OWNER = 'BUSINESS_OWNER',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',

}

