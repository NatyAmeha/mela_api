import { ObjectType, Field, Int } from '@nestjs/graphql';
import { SearchResult } from '../model/search.model';

@ObjectType()
export class SearchResponse {
    @Field(() => [SearchResult])
    results: SearchResult[];
    @Field(type => Int)
    total: number;
    @Field(type => Int)
    page: number;
    @Field(type => Int)
    limit: number;
}
