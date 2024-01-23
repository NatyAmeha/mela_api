import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class EmailAuthArgs {
    @Field((type) => String)
    email: string
    @Field(type => String)
    passwrod: string
}