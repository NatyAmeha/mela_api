import { LanguageKey } from "@app/common/model/localized_model"
import { Directive, Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql"
import { Transform } from "class-transformer"

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "key value")')
export class AuthLocalizedField {
    @Field(type => LanguageKey, { description: "the name of the language, ex. english, amharic" })
    @Transform((param) => param.value?.toUpperCase())
    key: string
    @Field()
    value: string
}

@InputType()
export class AuthLocalizedFieldInput {
    @Field(type => String)
    key: string
    @Field()
    value: string
}

registerEnumType(LanguageKey, { name: "LanguageKeyTest" }) 