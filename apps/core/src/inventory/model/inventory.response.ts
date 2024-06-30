import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Inventory } from "./inventory.model";
import { InventoryLocation } from "./inventory_location.model";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class InventoryResponse extends BaseResponse {
    @Field(type => Inventory)
    inventory?: Inventory;
    @Field(type => [Inventory])
    inventories?: Inventory[];
    @Field(type => InventoryLocation)
    location?: InventoryLocation;
    @Field(type => [InventoryLocation])
    locations?: InventoryLocation[];
    constructor(data: Partial<InventoryResponse>) {
        super()
        Object.assign(this, data)
    }
    isSafeErrorIfExist(): boolean {
        if (this.success == true) {
            return true
        }
        return false;
    }
}

export class InventoryResponseBuilder extends BaseResponseBuilder {
    constructor(private response: InventoryResponse = new InventoryResponse({})) {
        super(response);
    }

    withInventory(inventory: Inventory): InventoryResponseBuilder {
        this.response.success = true;
        this.response.inventory = inventory;
        return this;
    }

    withInventories(inventories: Inventory[]): InventoryResponseBuilder {
        this.response.success = true;
        this.response.inventories = inventories;
        return this;
    }

    withInvetoryLocation(location: InventoryLocation): InventoryResponseBuilder {
        this.response.success = true;
        this.response.location = location;
        return this;
    }

    withInventoryLocations(locations: InventoryLocation[]): InventoryResponseBuilder {
        this.response.success = true;
        this.response.locations = locations;
        return this;
    }

    build(): InventoryResponse {
        return this.response;
    }
}