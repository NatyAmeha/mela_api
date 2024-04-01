import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
@InputType('ProductGroupInput')
export class ProductGroup {
    @Field()
    id: string;

    @Field()
    name: string;

    @Field(types => [String])
    images?: string[];

    @Field({ nullable: true })
    description?: string;
    constructor(partial?: Partial<ProductGroup>) {
        Object.assign(this, partial);
    }
}