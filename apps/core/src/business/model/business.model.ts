import { Field, ID, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Customer } from "../../customer/model/customer.model";
import { ProductGroup } from "./product_group.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { Gallery } from "./gallery.model";
import { Address } from "./address.model";
import { Branch } from "../../branch/model/branch.model";
import { Product } from "../../product/model/product.model";
import { Staff } from "../../staff/model/staff.model";

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
    openingStatus: OpeningStatus;

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

    constructor(partial?: Partial<Business>) {
        Object.assign(this, partial);
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
