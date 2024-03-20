import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Customer } from "../../customer/model/customer.model";
import { ProductGroup } from "./product_group.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { Gallery } from "./gallery.model";
import { Address } from "./address.model";
import { Branch } from "./branch.model";

@ObjectType()
export class Business {
    @Field(() => ID)
    id?: string;

    @Field(() => [LocalizedData])
    name: LocalizedData[];

    @Field(() => [LocalizedData])
    description?: LocalizedData[];

    @Field(() => [String])
    categories: string[];

    @Field()
    isActive?: boolean;

    @Field(() => Gallery)
    gallery: Gallery;

    @Field(() => Date)
    createdAt?: Date;

    @Field(() => Date)
    updatedAt?: Date;

    @Field()
    creator: string;
    @Field(types => [String])
    customersId?: string[];
    @Field(types => [Customer])
    customers?: Customer[];

    @Field(() => OpeningStatus)
    openingStatus: OpeningStatus;
    @Field(types => [ProductGroup])
    group?: ProductGroup[];

    @Field(tyeps => Address)
    mainAddress: Address;
    @Field()
    phoneNumber: string;
    @Field()
    email?: string;
    @Field()
    website?: string;
    @Field(() => [String], { defaultValue: [] })
    branchIds?: string[];
    @Field(() => [Branch])
    branches?: Branch[];

    constructor(partial?: Partial<Business>) {
        Object.assign(this, partial);
    }
}

enum OpeningStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    TEMPORARILY_CLOSED = "TEMPORARILY_CLOSED",
}

registerEnumType(OpeningStatus, { name: "OpeningStatus" });
