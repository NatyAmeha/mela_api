import { LocalizedField } from "@app/common/model/localized_model";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum PaymentMethodType {
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
    PAY_AT_STORE = 'PAY_AT_STORE',
    BANK_TRANSFER = 'BANK_TRANSFER',
    ONLINE_PAYMENT = 'ONLINE_PAYMENT',

}

@ObjectType()
export class PaymentMethod {
    @Field(types => ID)
    id: string;
    @Field(types => [LocalizedField])
    name: LocalizedField[];
    @Field(types => PaymentMethodType)
    type?: string;
    constructor(partial?: Partial<PaymentMethod>) {
        Object.assign(this, partial);
    }
}

registerEnumType(PaymentMethodType, { name: 'PaymentMethodType' })