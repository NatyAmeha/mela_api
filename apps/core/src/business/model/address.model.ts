import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Address {
    @Field(() => ID)
    id: string;

    @Field()
    address?: string;

    @Field()
    city: string;

    @Field({ nullable: true })
    location?: string;

    constructor(partial?: Partial<Address>) {
        Object.assign(this, partial);
    }
}