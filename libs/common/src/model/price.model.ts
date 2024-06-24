import { Field, Float, ID, InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CurrencyKey } from "./currency.model";

@ObjectType({ isAbstract: true })
@InputType("PriceInput")
export class Price {
    @Field(type => ID)
    id?: string;
    @Field(types => Float)
    amount: number;
    @Field(type => CurrencyKey, { defaultValue: CurrencyKey.ETB })
    currency: string;
    constructor(data: Partial<Price>) {
        Object.assign(this, data)
    }

    static fromCreatePriceInput(data: Price) {
        return new Price(data)

    }
}