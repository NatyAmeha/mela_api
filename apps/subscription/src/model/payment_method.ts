import { LocalizedField } from "@app/common/model/localized_model"
import { Price } from "@app/common/model/price.model"
import { Directive, Field, ObjectType } from "@nestjs/graphql"
import { PaymentMethodInput } from "../dto/payment_method_input"
import { plainToClass } from "class-transformer"

@ObjectType()
@Directive('@shareable')
export class PaymentMethod {
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field(types => Price)
    amount: Price

    @Field(types => [String])
    receiptImages?: string[]

    constructor(data: Partial<PaymentMethod>) {
        Object.assign(this, data)
    }

    static from(paymentMethod: PaymentMethodInput) {
        return plainToClass(PaymentMethod, paymentMethod)
    }
}