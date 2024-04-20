import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
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

@InputType()
export class ProductGroupInput extends ProductGroup {
    @Field()
    name: string;

    @Field(types => [String])
    images?: string[];

    @Field({ nullable: true })
    description?: string;
}