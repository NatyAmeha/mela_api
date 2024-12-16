import { ObjectType, Field, Int, ID, InputType, Directive } from '@nestjs/graphql';
import { Branch } from '../../branch/model/branch.model';
import { Business } from '../../business/model/business.model';
import { Access, Permission } from 'apps/auth/src/authorization/model/access.model';
import { AppResources } from 'apps/mela_api/src/const/app_resource.constant';
import { PERMISSIONACTION } from '@app/common/permission_helper/permission_constants';
import { User } from 'apps/auth/src/auth/model/user.model';
import { PermissionType } from 'apps/auth/src/authorization/model/permission_type.enum';

@ObjectType()
@Directive('@shareable')
export class Staff {
    @Field(types => ID)
    id?: string;

    @Field()
    name: string;

    @Field(types => Int)
    pin?: number;
    @Field()
    phoneNumber: string
    @Field()
    password?: string

    @Field(types => [String])
    roles: string[];
    @Field()
    branchId?: string;
    @Field(types => Branch)
    branch?: Branch
    @Field()
    businessId?: string;
    @Field(types => Business)
    business?: Business



    @Field()
    isActive: boolean;

    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;


    constructor(partial?: Partial<Staff>) {
        Object.assign(this, partial);
    }

    createBranchStaffAccess(): Access[] {
        return [
            new Access({
                permissions: [
                    new Permission({ resourceType: AppResources.POS, action: PERMISSIONACTION.ANY, resourceTarget: this.branchId }),

                ],
                permissionType: PermissionType.BUSINESS_MANAGEMENT_PERMISSION,
            })
        ]
    }

    createBusinessStaffAccess(): Access[] {
        return [
            new Access({
                permissions: [
                    new Permission({ resourceType: AppResources.POS, action: PERMISSIONACTION.ANY, resourceTarget: this.businessId }),

                ],
                permissionType: PermissionType.BUSINESS_MANAGEMENT_PERMISSION,
            })
        ]
    }

    requireBranchAssignment(): boolean {
        return !(this.branchId === null || this.branchId === undefined);
    }

    toUser(): User {
        return new User({
            username: this.name,
            firstName: this.name,
            email: this.phoneNumber,

            phoneNumber: this.phoneNumber,
            password: this.password,
        });
    }
}

@InputType()
export class StaffInput {
    @Field()
    name: string;

    @Field(types => Int)
    pin: number;

    @Field(types => [String])
    roles: string[];
    @Field()
    branchId?: string;

    @Field()
    businessId?: string;
}