import { LocalizedField, LocalizedFieldInput } from '@app/common/model/localized_model';
import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { types } from 'joi';
import { ProductAddon } from '../../product/model/product_addon.model';

@ObjectType()
export class BusinessSection {
    @Field()
    id: string;

    @Field(types => [LocalizedField])
    @Type(() => LocalizedFieldInput)
    name: LocalizedField[];

    @Field()
    categoryId?: string

    @Field(types => [String])
    productIds?: string[];

    @Field(types => [String])
    images?: string[];

    @Field(types => [ProductAddon])
    orderAddons?: ProductAddon[]

    @Field(types => [LocalizedField])
    description?: LocalizedField[];
    constructor(partial?: Partial<BusinessSection>) {
        Object.assign(this, partial);
    }
}

@InputType()
export class CreateBusinessSectionInput {
    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @IsNotEmpty()
    name: LocalizedFieldInput[];

    @Field(types => [String])
    images?: string[];

    @Field(types => [LocalizedFieldInput])
    description?: LocalizedFieldInput[];


    static toBusinessSection(info: CreateBusinessSectionInput): BusinessSection {
        return new BusinessSection({
            name: info.name?.map((name) => new LocalizedField({ key: name.key, value: name.value })),
            images: info.images,
            description: info.description
        });
    }
}