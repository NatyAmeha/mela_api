import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";

@ObjectType()
@InputType("CurrencyInput")
export class Currency {
    @Field(type => CurrencyKey, { description: "the name of the currency, ex. USD, ETB" })
    key: string;
    @Field(type => Float, { description: "the value of the currency" })
    value: number
}

export enum CurrencyKey {
    USD = "USD",
    ETB = "ETB"
}
registerEnumType(CurrencyKey, { name: "CurrencyKey" })