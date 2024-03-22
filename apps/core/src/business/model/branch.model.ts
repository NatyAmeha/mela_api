import { Product } from "../../product/model/product.model";
import { Address } from "./address.model";
import { Business } from "./business.model";
import { Staff } from "./staff.model";
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
@InputType('BranchInput')
export class Branch {
    @Field(types => ID)
    id?: string;

    @Field()
    name: string;

    @Field()
    phoneNumber: string;

    @Field()
    email?: string;

    @Field()
    website?: string;

    @Field(types => [String], { defaultValue: [] })
    productIds: string[];
    @Field(types => [Product], { defaultValue: [] })
    products?: Product[];

    @Field()
    businessId: string;
    @Field(types => Business)
    business: Business

    @Field(types => [String], { defaultValue: [] })
    staffsId: string[];
    @Field(types => [Staff])
    staffs?: Staff[];
    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<Branch>) {
        Object.assign(this, partial);
    }
}
