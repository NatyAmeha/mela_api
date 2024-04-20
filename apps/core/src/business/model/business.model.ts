import { Field, ID, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Customer, CustomerInput } from "../../customer/model/customer.model";
import { ProductGroup, ProductGroupInput } from "./product_group.model";
import { LocalizedData, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Gallery, GalleryInput } from "./gallery.model";
import { Address, AddressInput } from "./address.model";
import { Branch } from "../../branch/model/branch.model";
import { Product } from "../../product/model/product.model";
import { Staff } from "../../staff/model/staff.model";
import { BaseModel } from "@app/common/model/base.model";

@ObjectType()
export class Business extends BaseModel {
    @Field(type => ID)
    id?: string

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

    @Field(type => [Staff])
    staffs?: Staff[]
    @Field()
    activeSubscriptionId?: string
    @Field(types => [String])
    subscriptionIds?: string[]
    @Field(types => [String])
    trialPeriodUsedServiceIds?: string[] = [];

    @Field(types => [LocalizedData])
    name: LocalizedData[];

    @Field(types => [LocalizedData])
    description?: LocalizedData[];

    @Field(types => [Customer])
    customers?: Customer[];

    constructor(partial?: Partial<Business>) {
        super();
        Object.assign(this, partial);
    }
}

@InputType()
export class BusinessInput {

    @Field(types => [LocalizedFieldInput])
    name: LocalizedFieldInput[];

    @Field(types => [LocalizedFieldInput])
    description?: LocalizedFieldInput[];

    @Field(types => [String])
    categories: string[];

    @Field()
    creator: string;

    @Field(types => [String])
    customersId?: string[];

    @Field(types => OpeningStatus)
    openingStatus: string;

    @Field(types => [ProductGroupInput])
    group?: ProductGroupInput[];

    @Field(types => [String])
    productIds?: string[];

    @Field(types => AddressInput)
    mainAddress: AddressInput;

    @Field()
    phoneNumber: string;
    @Field()

    email?: string;
    @Field()
    website?: string;
    @Field(types => [String], { defaultValue: [] })
    branchIds?: string[];


    @Field()
    activeSubscriptionId?: string

    @Field(types => [String])
    subscriptionIds?: string[]

    @Field(types => [String])
    trialPeriodUsedServiceIds?: string[] = [];

    @Field(types => GalleryInput)
    gallery: GalleryInput;

    @Field(types => [CustomerInput])
    customers?: CustomerInput[];

    constructor(partial?: Partial<Business>) {
        Object.assign(this, partial);
    }

    toBusiness(): Business {
        const business = new Business({ ...this, stage: BusinessRegistrationStage.BUSINESS_CREATED });
        return business;
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
