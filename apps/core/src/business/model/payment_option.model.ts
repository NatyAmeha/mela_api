import { LocalizedField } from "@app/common/model/localized_model";
import { Field, Float, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CreatePaymentOptionInput } from "../dto/payment_option.input";

export enum PaymentOptionType {
    FULL_PAYMENT = 'FULL_PAYMENT',
    INSTALLMENT = 'INSTALLMENT',
    DEPOSIT = 'DEPOSIT',
    PAY_LATER = 'PAY_LATER'
}

@ObjectType({ isAbstract: true })
export class PaymentOption {
    @Field(type => String)
    id?: string;

    @Field(type => [LocalizedField])
    name: LocalizedField[]

    @Field(type => PaymentOptionType, { defaultValue: PaymentOptionType.FULL_PAYMENT })
    type: string;

    @Field(types => Float)
    upfrontPayment?: number

    @Field()
    dueDate?: Date

    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<PaymentOption>) {
        Object.assign(this, partial);
    }


    static fromCreatePaymentOptionInput(data: CreatePaymentOptionInput): PaymentOption {
        return new PaymentOption({ ...data });
    }

}

registerEnumType(PaymentOptionType, {
    name: 'PaymentOptionType'
})