import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, ID, ObjectType } from "@nestjs/graphql";
import { MembershipPerkType } from "./memberhip.model";
import { Discount } from "apps/core/src/product/model/discount.model";

@ObjectType()
@Directive('@shareable')
export class Benefit {
    @Field(type => ID)
    id: string;
    @Field(type => [LocalizedField])
    name: LocalizedField[];
    @Field(type => String)
    perkType?: string;
    @Field(type => [Discount])
    discounts?: Discount[]
    constructor(data: Partial<Benefit>) {
        Object.assign(this, data)
    }
}

