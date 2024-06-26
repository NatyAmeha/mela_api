import { ObjectType, Field, ID, InputType } from "@nestjs/graphql";
import { Branch } from "../../branch/model/branch.model";

@ObjectType()
export class Customer {
    @Field(type => ID)
    id?: string;
    @Field()
    userId: string;

    @Field(types => [String], { defaultValue: [] })
    branchesId?: string[];
    @Field(types => [Branch], { defaultValue: [] })
    branches?: Branch[];

    constructor(partial?: Partial<Customer>) {
        Object.assign(this, partial);
    }
}

@InputType()
export class CustomerInput extends Customer {
    @Field()
    userId: string;

    @Field(types => [String], { defaultValue: [] })
    branchesId?: string[];

}