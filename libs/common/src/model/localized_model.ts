import { Directive, Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql"
import { Transform } from "class-transformer"


@ObjectType({ isAbstract: true })
@Directive('@key(fields: "key")')
export class LocalizedField {
    @Field(type => LanguageKey, { description: "the name of the language, ex. english, amharic" })
    @Transform((param) => param.value?.toUpperCase())
    key: string
    @Field()
    value: string
    constructor(data: Partial<LocalizedField>) {
        Object.assign(this, data)

    }
}

@InputType()
export class LocalizedFieldInput {
    @Field(type => LanguageKey, { description: "the name of the language, ex. english, amharic" })
    @Transform((param) => param.value?.toUpperCase())
    key: string
    @Field()
    value: string

    constructor(data: Partial<LocalizedFieldInput>) {
        Object.assign(this, data)

    }
}

export enum LanguageKey {
    ENGLISH = "ENGLISH",
    AMHARIC = "AMHARIC",
    OROMIC = "OROMIC"
}

registerEnumType(LanguageKey, { name: "LanguageKey" })