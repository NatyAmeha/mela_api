import { BaseModel } from "@app/common/model/base.model";
import { InventoryLocation } from "./inventory_location.model";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";

@ObjectType({ isAbstract: true })
export class Inventory extends BaseModel {
    @Field(types => ID)
    id: string;
    @Field()
    name: string;
    @Field()
    sku: string;
    @Field(types => Float)
    price: number;
    @Field(types => Float)
    qty: number;
    @Field()
    isAvailable: boolean
    @Field(types => [String])
    optionsIncluded: string[];
    @Field()
    locationId: string;
    @Field(types => InventoryLocation)
    location?: InventoryLocation;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(partial?: Partial<Inventory>) {
        super();
        Object.assign(this, partial);
    }
}