import { Field, Int, InterfaceType, ObjectType } from "@nestjs/graphql";

@ObjectType({ implements: () => Animal })
export class User implements Animal {
    @Field({ nullable: true })
    email?: String
    @Field({ nullable: true })
    password?: String
    @Field(type => Int, { nullable: true, })
    pin?: number


    constructor(data: Partial<User>) {
        Object.assign(this, data)
    }
    name: String;
}

@InterfaceType({
    resolveType(animaltype) {
        if (animaltype.name) {
            return
        }
    }
})
export abstract class Animal {
    @Field({ name: "name" })
    name: String
}