
import { Directive, Field, Float, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { DeliveryInfo, DeliveryInfoInput } from "./delivery.model";
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Branch } from "../../branch/model/branch.model";
import { Customer } from "../../customer/model/customer.model";
import { Gallery, GalleryInput } from "../../business/model/gallery.model";
import { Type } from "class-transformer";
import { ValidateNested, validate } from "class-validator";
import { BaseModel } from "@app/common/model/base.model";
import { Business } from "../../business/model/business.model";
import { Productoption } from "./product_options.model";
import { Inventory } from "../../inventory/model/inventory.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { CreateProductInput } from "../dto/product.input";
import { ProductAddon } from "./product_addon.model";

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Product extends BaseModel {
    @Field(types => String)
    id?: string;
    @Field(type => [LocalizedField])
    @Type(() => LocalizedField)
    name: LocalizedField[]

    @Field(type => [LocalizedField])
    @Type(() => LocalizedField)
    displayName?: LocalizedField[]

    @Field(types => [LocalizedField])
    description: LocalizedField[];

    @Field(types => Gallery)
    gallery: Gallery;

    @Field(types => Business)
    business: Business

    @Field(types => [String])
    tag?: string[];


    @Field(types => Int, { defaultValue: 1 })
    minimumOrderQty?: number

    @Field(types => Int, { defaultValue: 0 })
    loyaltyPoint: number;

    @Field(types => String)
    businessId: string;

    @Field(types => [String])
    sectionId?: string[];

    @Field(types => Boolean, { defaultValue: false })
    isActive: boolean;

    @Field(types => [String])
    category: string[];

    @Field(types => ProductType)
    type: string;

    @Field(types => Date)
    createdAt?: Date;

    @Field(types => Date)
    updatedAt?: Date;

    @Field(types => Boolean, { defaultValue: false })
    canOrderOnline: boolean;

    @Field(types => [String])
    reviewTopics?: string[];

    @Field()
    sku: string;
    @Field(types => [Productoption], { defaultValue: [] })
    options: Productoption[]
    @Field(types => [String], { defaultValue: [] })
    optionsIncluded: string[]
    @Field(types => [String])
    variantsId?: string[];
    @Field(types => [Product])
    variants?: Product[];
    @Field({ defaultValue: false })
    mainProduct?: boolean

    @Field(types => [Inventory])
    @Type(() => Inventory)
    inventory?: Inventory[]

    @Field(types => CallToActionType, { defaultValue: "Order" })
    callToAction?: string;

    @Field(types => [String])
    branchIds?: string[];

    @Field(types => String)
    deliveryInfoId?: string;

    @Field(types => [Branch])
    branches?: Branch[];

    @Field(types => [ProductAddon], { defaultValue: [] })
    addons?: ProductAddon[];

    @Field(types => [String], { defaultValue: [] })
    paymentOptionsId?: string[];

    // stats
    @Field(types => Int, { defaultValue: 0 })
    totalViews: number;


    constructor(partial?: Partial<Product>) {
        super()
        Object.assign(this, partial);
    }

    static async fromCreateProductInput(businessId: string, productInput: CreateProductInput): Promise<Product> {
        const generatedSku = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const { inventoryInfo, ...restProductInfo } = productInput;
        var product = new Product({
            ...restProductInfo,
            sku: generatedSku,
            businessId: businessId, inventory: [
                await Inventory.fromCreateInventory(productInput.name[0].value, generatedSku, productInput.inventoryInfo)
            ]
        });
        return product;
    }


    isProductPartOfBusiness(businessId: string): boolean {
        return this.businessId === businessId;
    }
}



export enum ProductType {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    GIFT_CARD = "GIFT_CARD",
    MEMBERSHIP = "MEMBERSHIP",
}



export enum CallToActionType {
    Order = "Order",
    Call = "Call",
    Book = "Book",
    Reserve = "Reserve",
}

registerEnumType(ProductType, { name: "ProductType" });
registerEnumType(CallToActionType, { name: "CallToActionType" });



