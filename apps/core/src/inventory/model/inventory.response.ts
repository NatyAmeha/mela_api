import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Inventory } from "./inventory.model";
import { InventoryLocation } from "./inventory_location.model";

export class InventoryResponse extends BaseResponse {
    inventory?: Inventory;
    inventories?: Inventory[];
    location?: InventoryLocation;
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

    withInvetoryLocation(location: InventoryLocation): InventoryResponseBuilder {
        this.response.location = location;
        return this;
    }

    withInventoryLocations(locations: InventoryLocation[]): InventoryResponseBuilder {
        this.response.locations = locations;
        return this;
    }

    build(): InventoryResponse {
        return this.response;
    }
}