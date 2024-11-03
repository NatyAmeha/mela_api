import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, Int, ObjectType } from "@nestjs/graphql";
import { Gallery } from "apps/core/src/business/model/gallery.model";

@ObjectType()
@Directive('@shareable')
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

    @Field(types => [String])
    variantsId?: string[];

    @Field({ defaultValue: false })
    mainProduct?: boolean

    @Field(types => String, { defaultValue: "Order" })
    callToAction?: string;

    @Field(types => [String])
    branchIds?: string[];

    constructor(data: Partial<MembershipProduct>) {
        Object.assign(this, data)
    }

    static getMembershipProductsfromRawProductDataInput(data: any[]) {
        if (!data || data.length) return []
        return data?.map(product => new MembershipProduct({ ...product }));
    }
}