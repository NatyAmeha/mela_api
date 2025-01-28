import { LocalizedFieldInput } from '@app/common/model/localized_model';
import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { CreateRewardInput } from './reward.input';

@InputType()
export class CreateLoyaltyTierInput {
    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[];

    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    description?: LocalizedFieldInput[];

    @Field()
    minimumPoints: number;

    @Field(type => [CreateRewardInput])
    @Type(() => CreateRewardInput)
    rewards: CreateRewardInput[];

    @Field(type => [String])
    businessIds: string[];

    @Field(type => [String])
    productIds?: string[];
} 