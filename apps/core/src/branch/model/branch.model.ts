import { Product } from "../../product/model/product.model";
import { Address, AddressInput } from "../../business/model/address.model";

import { Staff, StaffInput } from "../../staff/model/staff.model";
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Business } from "../../business/model/business.model";
import { InventoryLocation } from "../../inventory/model/inventory_location.model";
import { ProductBundle } from "../../product/model/product_bundle.model";

@ObjectType()
export class Branch {
    @Field(types => ID)
    id?: string;

    @Field(types => [LocalizedField])
    name: LocalizedField[];

    @Field()
    phoneNumber: string;

    @Field()
    email?: string;

    @Field()
    website?: string;

    @Field(types => Address)
    address: Address;

    @Field(types => [String], { defaultValue: [] })
    productIds?: string[];
    @Field(types => [Product], { defaultValue: [] })
    products?: Product[];

    @Field()
    businessId: string;

    @Field(types => Business)
    business: Business


    @Field(types => [String], { defaultValue: [] })
    staffsId?: string[];
    @Field(types => [Staff])
    staffs?: Staff[];
    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;
    @Field()
    isActive?: boolean;

    @Field(types => [String], { defaultValue: [] })
    inventoryLocations?: InventoryLocation[];
    @Field(types => [ProductBundle])
    bundles?: ProductBundle[]


    constructor(partial?: Partial<Branch>) {
        Object.assign(this, partial);
    }

    getInventoryLocationIds() {
        return this.inventoryLocations.map(location => location.id)

    }
}

@InputType()
export class BranchInput {

    @Field(types => [LocalizedFieldInput])
    name: LocalizedFieldInput[];

    @Field()
    phoneNumber: string;

    @Field()
    email?: string;

    @Field()
    website?: string;

    @Field(types => AddressInput)
    address: AddressInput;

    @Field(types => [String], { defaultValue: [] })
    productIds?: string[];


    @Field()
    businessId: string;

    @Field(types => [String], { defaultValue: [] })
    staffsId?: string[];

    @Field(types => [StaffInput])
    staffs?: StaffInput[];
}
