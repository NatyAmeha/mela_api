import { Field, Float, InputType, ObjectType, PartialType, registerEnumType } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export enum Currency {
    USD = "USD",
    ETB = "ETB"
}
@ObjectType()
@InputType("PriceInfoInput")
export class PriceInfo {
    @Field(types => Float)
    amount: number;
    @Field(type => Currency, { defaultValue: Currency.ETB })
    currency: string;
    constructor(data: Partial<PriceInfo>) {
        Object.assign(this, data)
    }
}

@InputType()
export class PriceInfoInput extends PriceInfo {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsString()
    currency: string;
    constructor(data: Partial<PriceInfoInput>) {
        super({})
        Object.assign(this, data)
    }
}


registerEnumType(Currency, { name: "Currency" })