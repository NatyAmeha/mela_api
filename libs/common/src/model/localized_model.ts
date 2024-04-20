import { Directive, Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql"
import { Transform } from "class-transformer"


@ObjectType()
@Directive('@key(fields: "key")')
export class LocalizedData {
    @Field(type => LanguageKey, { description: "the name of the language, ex. english, amharic" })
    @Transform((param) => param.value?.toUpperCase())
    key: string
    @Field()
    value: string
}

@InputType()
export class LocalizedFieldInput {
    @Field(type => LanguageKey, { description: "the name of the language, ex. english, amharic" })
    @Transform((param) => param.value?.toUpperCase())
    key: string
    @Field()
    value: string
}

export enum LanguageKey {
    ENGLISH = "ENGLISH",
    AMHARIC = "AMHARIC",
    OROMIC = "OROMIC"
}

registerEnumType(LanguageKey, { name: "LanguageKey" })