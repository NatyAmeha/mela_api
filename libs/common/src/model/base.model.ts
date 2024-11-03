import { Field, ID, ObjectType } from "@nestjs/graphql";
import { classToPlain, instanceToPlain } from "class-transformer";

ObjectType({})
export class BaseModel {

    @Field(types => ID)
    id?: string;
    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;



    static fromObject<T extends BaseModel>(this: new () => T, object: Record<string, any>): T {
        return Object.assign(new this(), object);
    }
} 