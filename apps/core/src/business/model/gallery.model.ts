import { ObjectType, Field, ID, InputType } from "@nestjs/graphql";
import { types } from "joi";

@ObjectType()
@InputType("GalleryInput")
export class Gallery {
    @Field({ description: "The logo image of the gallery" })
    logoImage?: string;

    @Field({ description: "The cover image of the gallery" })
    coverImage?: string;

    @Field(() => [GalleryData], { description: "The images in the gallery" })
    images?: GalleryData[];

    @Field(() => [GalleryData], { description: "The videos in the gallery" })
    videos?: GalleryData[];
    constructor(partial?: Partial<Gallery>) {
        Object.assign(this, partial);
    }
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

