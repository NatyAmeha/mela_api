import { ObjectType, Field, ID, InputType } from "@nestjs/graphql";
import { Expose, Type } from "class-transformer";
import { types } from "joi";

@ObjectType()
@InputType("GalleryInput")
export class Gallery {
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

@ObjectType()
@InputType("GalleryDataInput")
class GalleryData {
    @Field(types => ID)
    url: string;

    @Field()
    featured?: boolean;

    constructor(partial?: Partial<GalleryData>) {
        Object.assign(this, partial);
    }
}

