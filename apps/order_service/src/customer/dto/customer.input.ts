import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateCustomerInput {

    @Field()
    name: string;
    @Field()
    userId: string;
    @Field()
    phoneNumber: string;
    @Field()
    email?: string

    constructor(object: Partial<CreateCustomerInput>) {
        Object.assign(this, object);
    }
}