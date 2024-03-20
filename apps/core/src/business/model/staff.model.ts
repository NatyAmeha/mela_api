import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Branch } from './branch.model';

@ObjectType()
export class Staff {
    @Field(() => ID)
    id?: string;

    @Field()
    name: string;

    @Field(() => Int)
    pin: number;

    @Field(() => [String])
    roles: string[];
    @Field()
    branchId?: string;
    @Field(() => Branch)
    branch?: Branch

    @Field()
    isActive: boolean;


    constructor(partial?: Partial<Staff>) {
        Object.assign(this, partial);
    }
}