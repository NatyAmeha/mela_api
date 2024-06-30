import { Directive, Field, Float, ID, InputType, ObjectType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { CurrencyKey } from "./currency.model";

@ObjectType()
@Directive('@key(fields: "id, amount, currency")')
export class Price {
    @Field(type => ID)
    id?: string;
    @Field(types => Float)
    amount: number;
    @Field(type => String)
    currency: string;
    constructor(data: Partial<Price>) {
        Object.assign(this, data)
    }

    static fromCreatePriceInput(data: Price) {
        return new Price(data)

    }
}

@InputType()
export class PriceInput extends OmitType(Price, ['id']) {
    @Field(types => Float)
    amount: number;
    @Field(type => CurrencyKey, { defaultValue: CurrencyKey.ETB })
    currency: string;

}