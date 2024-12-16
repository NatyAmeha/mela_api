import { ObjectType, Field, ID, InputType, Directive } from '@nestjs/graphql';

@ObjectType()
@Directive('@shareable')
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
@InputType()
export class AddressInput {
    @Field()
    address?: string;

    @Field()
    city: string;

    @Field({ nullable: true })
    location?: string;
}