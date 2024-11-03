import { LocalizedField } from "@app/common/model/localized_model";
import { Price } from "@app/common/model/price.model";
import { Field, Float, InputType, ObjectType, PartialType, registerEnumType } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { PaymentMethodInput } from "../dto/payment_method_input";


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


@ObjectType()
class PaymentMethod {
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field(types => Price)
    amount: Price

    @Field(types => [String])
    receiptImages?: string[]

    @Field()
    createdAt: Date
    @Field()
    updatedAt?: Date

    constructor(data: Partial<PaymentMethod>) {
        Object.assign(this, data)
    }

    static fromPaymentMethodInput(data: PaymentMethodInput) {
        return new PaymentMethod({
            name: data.name?.map(name => new LocalizedField({ ...name })),
            amount: new Price({ ...data.amount }),
            receiptImages: data.receiptImages
        })
    }
}





registerEnumType(Currency, { name: "Currency" })