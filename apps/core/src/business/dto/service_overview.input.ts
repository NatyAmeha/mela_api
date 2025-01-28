import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { IsArray, IsOptional } from "class-validator";
import { Field, InputType, PartialType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { GalleryInput } from "../model/gallery.model";


@InputType()
export class CreateServiceOverviewInput {

    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @IsArray()
    @IsNotEmpty()
    title: LocalizedFieldInput[];

    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @IsArray()
    @IsNotEmpty()
    description: LocalizedFieldInput[];

    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @IsArray()
    @IsOptional()
    callToAction?: LocalizedFieldInput[];

    @Field()
    @IsOptional()
    callToActionUrl?: string;

    @Field(type => GalleryInput)
    @Type(() => GalleryInput)
    gallery?: GalleryInput;

    @Field(type => Boolean, { defaultValue: true })
    isActive: boolean;

    @Field(type => Boolean, { defaultValue: false })
    featured: boolean;


    constructor(data: Partial<CreateServiceOverviewInput>) {
        Object.assign(this, data)
    }


}

@InputType()
export class UpdateServiceOverviewInput extends PartialType(CreateServiceOverviewInput) {

}