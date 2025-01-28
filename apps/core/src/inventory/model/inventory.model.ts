import { BaseModel } from "@app/common/model/base.model";
import { InventoryLocation } from "./inventory_location.model";
import { Directive, Field, Float, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CreateInventoryInput } from "../../product/dto/inventory.input";
import { validate } from "class-validator";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { Price } from "@app/common/model/price.model";

export enum ProductUnitType {
    Unit = "Unit",
    Kg = "Kg",
    KG = "KG",
    Litre = "Litre",
}

@ObjectType()
@Directive('@shareable')
export class Inventory extends BaseModel {
    @Field(types => ID)
    id: string;
    @Field()
    name: string;
    @Field()
    sku: string;
    @Field(types => [Price])
    priceInfo: Price[];
    @Field(types => Float)
    qty: number;

    @Field(type => String, { defaultValue: ProductUnitType.Unit })
    unit?: string;

    @Field()
    productId?: string;

    @Field(types => Int, { defaultValue: 1 })
    minOrderQty?: number
    @Field(types => Int, { defaultValue: 100 })
    maxOrderQty?: number
    @Field()
    isAvailable: boolean
    @Field(types => [String])
    optionsIncluded: string[];
    @Field()
    inventoryLocationId: string;
    @Field(types => InventoryLocation)
    inventoryLocation?: InventoryLocation;
    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<Inventory>) {
        super();
        Object.assign(this, partial);
    }

    static async fromCreateInventory(productdName: string, productSku: string, inventoryInput: CreateInventoryInput) {
        const inventoryName = `${productdName} - ${productSku}`;
        const inventorySku = `${productSku}-${inventoryInput.inventoryLocationId}`;
        return new Inventory({
            ...inventoryInput,
            sku: inventorySku,
            name: inventoryName,
        });
    }
}

registerEnumType(ProductUnitType, { name: "ProductUnitType" });

