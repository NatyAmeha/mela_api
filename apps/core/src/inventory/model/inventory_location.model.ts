import { BaseModel } from "@app/common/model/base.model";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Branch } from "../../branch/model/branch.model";
import { Business } from "../../business/model/business.model";
import { CreateInventoryLocationInput } from "../dto/inventory_location.input";

@ObjectType()
export class InventoryLocation extends BaseModel {
    @Field(types => ID)
    id: string;
    @Field()
    name: string;
    @Field()
    city?: string;
    @Field()
    location: string;
    @Field()
    address?: string;
    @Field()
    phoneNumber: string;

    branchId: string;
    branch?: Branch;

    businessId: string;
    business?: Business;

    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<InventoryLocation>) {
        super();
        Object.assign(this, partial);
    }

    static getInventoryLocationInfo(businessId: string, branchId: string, locationData: CreateInventoryLocationInput): InventoryLocation {
        return new InventoryLocation({
            name: locationData.name,
            city: locationData.city,
            location: locationData.location,
            phoneNumber: locationData.phoneNumber,
            branchId: branchId,
            businessId: businessId
        })
    }


}

export class InventoryLocationBuilder {
    private inventoryLocation: InventoryLocation;

    constructor() {
        this.inventoryLocation = new InventoryLocation();
    }

    fromBranch(branch: Branch): InventoryLocationBuilder {
        this.inventoryLocation.name = `${branch.name[0].value} Inventory Location`;
        this.inventoryLocation.city = branch.address.city;
        this.inventoryLocation.location = branch.address.location;
        this.inventoryLocation.address = branch.address.address;
        this.inventoryLocation.phoneNumber = branch.phoneNumber;
        this.inventoryLocation.branchId = branch.id;
        this.inventoryLocation.businessId = branch.businessId;
        return this;
    }

    build(): InventoryLocation {
        return this.inventoryLocation;
    }


}