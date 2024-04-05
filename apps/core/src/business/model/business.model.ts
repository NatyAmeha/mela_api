import { Field, ID, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Customer } from "../../customer/model/customer.model";
import { ProductGroup } from "./product_group.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { Gallery } from "./gallery.model";
import { Address } from "./address.model";
import { Branch } from "../../branch/model/branch.model";
import { Product } from "../../product/model/product.model";
import { Staff } from "../../staff/model/staff.model";
import { Access, AccessOwnerType, AppResources, DefaultRoles, Permission } from "apps/auth/src/authorization/model/access.model";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { IMessageBrocker } from "libs/rmq/message_brocker";
import { AuthServiceMessageType } from "libs/rmq/app_message_type";
import { AppMsgQueues } from "libs/rmq/constants";
import { PermissionType } from "apps/auth/src/authorization/model/permission_type.enum";

@ObjectType()
@InputType("BusinessInput")
export class Business {
    @Field(types => ID)
    id?: string;

    @Field(types => [LocalizedData])
    name: LocalizedData[];

    @Field(types => [LocalizedData])
    description?: LocalizedData[];

    @Field(types => [String])
    categories: string[];

    @Field()
    isActive?: boolean;

    @Field(types => Gallery)
    gallery: Gallery;

    @Field(types => Date)
    createdAt?: Date;

    @Field(types => Date)
    updatedAt?: Date;

    @Field()
    creator: string;
    @Field(types => [String])
    customersId?: string[];
    @Field(types => [Customer])
    customers?: Customer[];

    @Field(types => OpeningStatus)
    openingStatus: string;

    @Field(types => [ProductGroup])
    group?: ProductGroup[];

    @Field(types => [String])
    productIds?: string[];

    @Field(types => [Product])
    products?: Product[]

    @Field(types => Address)
    mainAddress: Address;
    @Field()
    phoneNumber: string;
    @Field()
    email?: string;
    @Field()
    website?: string;
    @Field(types => [String], { defaultValue: [] })
    branchIds?: string[];
    @Field(types => [Branch])
    branches?: Branch[];
    @Field(types => BusinessRegistrationStage)
    stage: string

    @Field()
    staffs?: Staff[]
    @Field(types => [String])
    subscriptionIds?: string[];
    @Field(types => [String])
    trialPeriodUsedServiceIds?: string[];

    constructor(partial?: Partial<Business>) {
        Object.assign(this, partial);
    }



    generateDefaultBusinessOwnerPermission(): Access[] {
        let manageBusinessPermission = new Access({
            role: DefaultRoles.BUSINESS_OWNER,
            owner: this.creator,
            ownerType: AccessOwnerType.USER,
            permissionType: PermissionType.PLATFORM_PERMISSION,
            permissions: [
                new Permission({ resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourceTarget: this.id }),
            ]
        })
        return [manageBusinessPermission]
    }



}

enum OpeningStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    TEMPORARILY_CLOSED = "TEMPORARILY_CLOSED",
}

export enum BusinessRegistrationStage {
    BUSINESS_CREATED = "CREATED",
    PRODUCT_SELECTED = "SERVICE_SELECTED",
    PAYMENT_STAGE = "PAYMENT_STAGE",
    COMPLETED = "COMPLETED",
}

registerEnumType(BusinessRegistrationStage, { name: "BusinessRegistrationStage" });

registerEnumType(OpeningStatus, { name: "OpeningStatus" });
