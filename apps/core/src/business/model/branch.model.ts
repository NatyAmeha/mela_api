import { Product } from "../../product/model/product.model";
import { Address } from "./address.model";
import { Business } from "./business.model";
import { Staff } from "./staff.model";
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Branch {
    @Field(() => ID)
    id?: string;

    @Field()
    name: string;

    @Field(tyeps => Address)
    address: Address;

    @Field()
    phoneNumber: string;

    @Field()
    email?: string;

    @Field()
    website?: string;

    @Field(() => [String], { defaultValue: [] })
    productIds: string[];
    @Field(() => [Product], { defaultValue: [] })
    products?: Product[];

    @Field()
    businessId: string;
    @Field(() => Business)
    business: Business

    @Field(() => [ID], { defaultValue: [] })
    staffsId: string[];
    @Field(() => [Staff])
    staffs?: Staff[];
    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<Branch>) {
        Object.assign(this, partial);
    }
}