import { Field, ID, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Customer, CustomerInput } from "../../customer/model/customer.model";
import { BusinessSection, CreateBusinessSectionInput } from "./business_section.model";
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Gallery, GalleryInput } from "./gallery.model";
import { Address, AddressInput } from "./address.model";
import { Branch } from "../../branch/model/branch.model";
import { Product } from "../../product/model/product.model";
import { Staff } from "../../staff/model/staff.model";
import { BaseModel } from "@app/common/model/base.model";
import { includes } from "lodash";
import { DeliveryInfo } from "../../product/model/delivery.model";
import { ProductBundle } from "../../product/model/product_bundle.model";
import { PaymentOption } from "./payment_option.model";

@ObjectType()
export class Business extends BaseModel {
    @Field(type => ID)
    id?: string

    @Field()
    type: string

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

    @Field(types => [BusinessSection])
    sections?: BusinessSection[];

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

    @Field(types => [LocalizedField])
    name: LocalizedField[];

    @Field(types => [LocalizedField])
    description?: LocalizedField[];

    @Field(types => [Customer])
    customers?: Customer[];

    @Field(types => [DeliveryInfo])
    deliveryInfo?: DeliveryInfo[]

    @Field(types => [ProductBundle])
    bundles?: ProductBundle[]

    @Field(types => [PaymentOption])
    paymentOptions?: PaymentOption[]

    @Field(types => Int, { defaultValue: 0 })
    totalViews: number;

    platformServiceTrialPeriodUsed(platformServiceId: string) {
        return includes(this.trialPeriodUsedServiceIds, platformServiceId)
    }

    constructor(partial?: Partial<Business>) {
        super();
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
