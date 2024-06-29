import { Field, Float, InputType, PartialType } from "@nestjs/graphql";
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { IsDate, IsNotEmpty, ValidateIf } from "class-validator";
import { Type } from "class-transformer";
import { PaymentOption, PaymentOptionType } from "../model/payment_option.model";
import { types } from "joi";

@InputType()
export class CreatePaymentOptionInput {
    @IsNotEmpty()
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[];

    @Field(types => PaymentOptionType)
    @IsNotEmpty()
    type: string;

    @ValidateIf((obj: CreatePaymentOptionInput, value) => obj.type == PaymentOptionType.PAY_LATER)
    @IsDate()
    @IsNotEmpty()
    dueDate?: Date;


    @Field(types => Float, { defaultValue: 0 })
    upfrontPayment?: number;

    constructor(partial?: Partial<CreatePaymentOptionInput>) {
        Object.assign(this, partial);
    }


}