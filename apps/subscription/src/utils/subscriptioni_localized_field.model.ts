import { LanguageKey } from "@app/common/model/localized_model"
import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql"
import { Transform } from "class-transformer"

@ObjectType()
@InputType("SubscriptionLocalizedFieldInput")
export class SubscriptionLocalizedField {
    @Field(type => String, { description: "the name of the language, ex. english, amharic" })
    @Transform((param) => param.value?.toUpperCase())
    key: string
    @Field()
    value: string
}
registerEnumType(LanguageKey, { name: "LanguageKey" })