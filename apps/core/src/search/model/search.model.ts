import { LocalizedField } from '@app/common/model/localized_model';
import { Price } from '@app/common/model/price.model';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export enum SearchType {
    PRODUCT = "Product",
    BUSINESS = "Business",
    CUSTOMER = "Customer",
    USER = "User"
}

@ObjectType()
export class SearchResult {
    @Field(() => ID)
    id: string;

    @Field()
    type: string;

    @Field(() => [LocalizedField])
    name: LocalizedField[];

    @Field(() => [Price], { nullable: true })
    prices?: Price[];

    @Field(() => String, { nullable: true })
    metadata?: string; // JSON string or another appropriate type

    constructor(init: Partial<SearchResult>) {
        Object.assign(this, init);
    }
}
