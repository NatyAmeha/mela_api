
import { Directive, Field, Float, InputType, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { DeliveryInfo, DeliveryInfoInput } from "./delivery.model";
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Branch } from "../../branch/model/branch.model";
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
import { ProductPrice } from "./product_price.model";
import { Discount } from "./discount.model";
import { Membership } from "apps/subscription/src/membership/model/memberhip.model";
import { SearchResult, SearchType } from "../../search/model/search.model";
import { Calendar } from "../../calendar/model/calendar.model";


@ObjectType()
@Directive('@shareable')
export class ProductFeaturedInfo {
    @Field()
    featured?: boolean
    @Field(types => [String])
    branchIds?: string[]
}

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
@Directive('@shareable')
export class Product extends BaseModel {
    @Field(types => String)
    id?: string;
    @Field(type => [LocalizedField])
    @Type(() => LocalizedField)
    name: LocalizedField[]

    @Field(type => [LocalizedField])
    @Type(() => LocalizedField)
    displayName?: LocalizedField[]

    @Field({ defaultValue: false })
    featured: boolean

    @Field(types => ProductFeaturedInfo)
    featuredInfo?: ProductFeaturedInfo

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

    @Field(types => ProductType, { defaultValue: "PRODUCT" })
    type?: string;

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

    @Field(types => [ProductPrice])
    prices?: ProductPrice[]

    @Field(types => [Inventory])
    @Type(() => Inventory)
    inventory?: Inventory[]

    @Field(types => String, { defaultValue: "Order" })
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

    @Field(types => [String])
    membershipIds?: string[];

    @Field(type => [Membership])
    memberships?: Membership[];

    @Field(type => [Discount])
    discounts?: Discount[]

    @Field(type => [Calendar])
    calendars?: Calendar[]


    // stats
    @Field(types => Int, { defaultValue: 0 })
    totalViews: number;



    constructor(partial?: Partial<Product>) {
        super()
        Object.assign(this, partial);
    }

    addProductPrices(prices: ProductPrice[]) {
        this.prices = prices;
    }

    hasVariant(): boolean {
        return this.mainProduct && this?.variantsId?.length > 0
    }

    static async fromCreateProductInput(businessId: string, productInput: CreateProductInput): Promise<Product> {
        const generatedSku = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const { inventoryInfo, ...restProductInfo } = productInput;
        var product = new Product({
            ...restProductInfo,
            sku: generatedSku,
            prices: [ProductPrice.createDefaultPrice(productInput.defaultPrice)],
            businessId: businessId, inventory: await Promise.all(productInput.inventoryInfo.map(inventory => Inventory.fromCreateInventory(productInput.name[0].value, generatedSku, inventory)))
        });
        return product;
    }


    isProductPartOfBusiness(businessId: string): boolean {
        return this.businessId === businessId;
    }

    toSearchResult(): SearchResult {
        return new SearchResult({
            id: this.id,
            type: SearchType.PRODUCT,
            name: this.name,
            prices: this.prices?.[0]?.price,
        });
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



