import { Product } from "../../product/model/product.model";
import { Address } from "../../business/model/address.model";
import { Business } from "../../business/model/business.model";
import { Staff } from "../../staff/model/staff.model";
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { LocalizedData } from "@app/common/model/localized_model";

@ObjectType()
@InputType('BranchInput')
export class Branch {
    @Field(types => ID)
    id?: string;

    @Field(types => [LocalizedData])
    name: LocalizedData[];

    @Field()
    phoneNumber: string;

    @Field()
    email?: string;

    @Field()
    website?: string;

    @Field(types => Address)
    address: Address;

    @Field(types => [String], { defaultValue: [] })
    productIds?: string[];
    @Field(types => [Product], { defaultValue: [] })
    products?: Product[];

    @Field()
    businessId: string;
    @Field(types => Business)
    business?: Business

    @Field(types => [String], { defaultValue: [] })
    staffsId?: string[];
    @Field(types => [Staff])
    staffs?: Staff[];
    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;
    @Field()
    isActive?: boolean;

    constructor(partial?: Partial<Branch>) {
        Object.assign(this, partial);
    }
}
