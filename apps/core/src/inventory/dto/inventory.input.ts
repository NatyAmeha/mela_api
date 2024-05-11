import { InputType, PartialType } from "@nestjs/graphql";
import { Inventory } from "../model/inventory.model";
import { InventoryLocation } from "../model/inventory_location.model";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class CreateInventoryLocationInput extends PartialType(InventoryLocation) {
    @IsNotEmpty()
    name: string;
    city?: string;
    @IsNotEmpty()
    location: string;
    @IsNotEmpty()
    phoneNumber: string;

    getInventoryLocation(branchId: string): InventoryLocation {
        return new InventoryLocation({
            name: this.name,
            city: this.city,
            location: this.location,
            phoneNumber: this.phoneNumber,
            branchId: branchId
        })
    }
}