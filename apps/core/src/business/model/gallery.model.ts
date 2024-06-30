import { Directive, Field, ID, InputType, ObjectType } from "@nestjs/graphql";
import { Expose, Type } from "class-transformer";
import { types } from "joi";

@ObjectType()
@Directive('@key(fields: "id, logoImage, coverImage, images{featured, url}, videos{featured, url}")')
export class Gallery {
    @Field(type => ID)
    id?: string
    @Field({ description: "The logo image of the gallery" })
    logoImage?: string;

    @Field({ description: "The cover image of the gallery" })
    coverImage?: string;

    @Field(types => [GalleryData], { description: "The images in the gallery" })
    @Type(() => GalleryData)
    images?: GalleryData[];

    @Field(types => [GalleryData], { description: "The videos in the gallery" })
    videos?: GalleryData[];
    constructor(partial?: Partial<Gallery>) {
        Object.assign(this, partial);
    }
}
@InputType()
export class GalleryInput extends Gallery {
    @Field({ description: "The logo image of the gallery" })
    logoImage?: string;

    @Field({ description: "The cover image of the gallery" })
    coverImage?: string;

    @Field(types => [GalleryDataInput], { description: "The images in the gallery" })
    @Type(() => GalleryDataInput)
    images?: GalleryDataInput[];

    @Field(types => [GalleryDataInput], { description: "The videos in the gallery" })
    videos?: GalleryDataInput[];
}

@ObjectType()
class GalleryData {
    @Field(types => ID)
    url: string;

    @Field()
    featured?: boolean;

    constructor(partial?: Partial<GalleryData>) {
        Object.assign(this, partial);
    }
}

@InputType()
class GalleryDataInput {
    @Field(types => ID)
    url: string;

    @Field()
    featured?: boolean;
}

