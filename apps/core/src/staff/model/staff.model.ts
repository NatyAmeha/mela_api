import { ObjectType, Field, Int, ID, InputType } from '@nestjs/graphql';
import { Branch } from '../../branch/model/branch.model';
import { Business } from '../../business/model/business.model';

@ObjectType()
export class Staff {
    @Field(types => ID)
    id?: string;

    @Field()
    name: string;

    @Field(types => Int)
    pin: number;

    @Field(types => [String])
    roles: string[];
    @Field()
    branchId?: string;
    @Field(types => Branch)
    branch?: Branch
    @Field()
    businessId?: string;
    @Field(types => Business)
    business?: Business

    @Field()
    isActive: boolean;

    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;


    constructor(partial?: Partial<Staff>) {
        Object.assign(this, partial);
    }
}

@InputType()
export class StaffInput {
    @Field()
    name: string;

    @Field(types => Int)
    pin: number;

    @Field(types => [String])
    roles: string[];
    @Field()
    branchId?: string;

    @Field()
    businessId?: string;
}