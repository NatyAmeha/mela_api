import { BaseModel } from "@app/common/model/base.model";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Branch } from "../../branch/model/branch.model";
import { Business } from "../../business/model/business.model";

@ObjectType({ isAbstract: true })
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