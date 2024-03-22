import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
@InputType('AddressInput')
export class Address {
    @Field(types => ID)
    id?: string;

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