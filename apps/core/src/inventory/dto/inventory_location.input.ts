import { InputType, PartialType } from "@nestjs/graphql";
import { Inventory } from "../model/inventory.model";
import { InventoryLocation } from "../model/inventory_location.model";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class CreateInventoryLocationInput extends PartialType(InventoryLocation) {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    city?: string;
    @IsNotEmpty()
    location: string;
    @IsNotEmpty()
    phoneNumber: string;
}

@InputType()
export class UpdateInventoryLocationInput extends PartialType(InventoryLocation) {
    name?: string;
    city?: string;
    address?: string;
    location?: string;
    phoneNumber?: string;
    @IsString()
    @IsNotEmpty()
    branchId: string;
    @IsString()
    @IsNotEmpty()
    businessId: string;

    getInventoryLocation(): InventoryLocation {
        return new InventoryLocation({ ...this })
    }
}