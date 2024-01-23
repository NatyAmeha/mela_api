import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class User {
    @Field({ nullable: true })
    email?: String
    @Field({ nullable: true })
    password?: String
    @Field(type => Int, { nullable: true })
    pin?: number

    constructor(data: Partial<User>) {
        Object.assign(this, data)
    }
}