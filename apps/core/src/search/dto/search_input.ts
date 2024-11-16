import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SearchInput {
    @Field()
    term: string;

    @Field(() => String, { nullable: true })
    businessId?: string;

    @Field(() => String, { nullable: true })
    businessSectionId?: string;

    // Add more filters as needed
}
