import { LocalizedField } from "@app/common/model/localized_model";
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Gallery } from "apps/core/src/business/model/gallery.model";

@ObjectType()
export class MembershipProduct {
    @Field(type => String)
    id: string;
    @Field(type => [LocalizedField])
    name: LocalizedField[]
    @Field(types => Gallery)
    gallery: Gallery;


    @Field(types => [String])
    tag?: string[];


    @Field(types => Int, { defaultValue: 0 })
    loyaltyPoint: number;

    @Field(types => String)
    businessId: string;

    @Field(types => Boolean, { defaultValue: false })
    isActive: boolean;

    @Field(types => [String])
    category: string[];

    @Field(types => String)
    type: string;

    @Field(types => Boolean, { defaultValue: false })
    canOrderOnline: boolean;

    @Field(types => [String])
    reviewTopics?: string[];

    // @Field()
    // sku: string;
    // @Field(types => [Productoption], { defaultValue: [] })
    // options: Productoption[]
    // @Field(types => [String], { defaultValue: [] })
    // optionsIncluded: string[]
    @Field(types => [String])
    variantsId?: string[];

    @Field({ defaultValue: false })
    mainProduct?: boolean

    // @Field(types => [Inventory])
    // @Type(() => Inventory)
    // inventory?: Inventory[]

    @Field(types => String, { defaultValue: "Order" })
    callToAction?: string;

    @Field(types => [String])
    branchIds?: string[];

    // @Field(types => String)
    // deliveryInfoId?: string;

    // @Field(types => [Branch])
    // branches?: Branch[];

    // @Field(types => [ProductAddon], { defaultValue: [] })
    // addons?: ProductAddon[];

    // @Field(types => [String], { defaultValue: [] })
    // paymentOptionsId?: string[];

    // // stats
    // @Field(types => Int, { defaultValue: 0 })
    // totalViews: number;
}