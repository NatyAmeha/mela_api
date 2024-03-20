import { ObjectType, Field, ID } from "@nestjs/graphql";
import { Branch } from "../../business/model/branch.model";

@ObjectType()
export class Customer {
    @Field(type => ID)
    id?: string;
    @Field()
    userId: string;


    @Field(types => [String], { defaultValue: [] })
    branchesId?: string[];
    @Field(() => [Branch], { defaultValue: [] })
    branches?: Branch[];

    constructor(partial?: Partial<Customer>) {
        Object.assign(this, partial);
    }
}