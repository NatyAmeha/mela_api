import { Field, InputType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Address, AddressInput } from "../model/address.model";
import { Gallery, GalleryInput } from "../model/gallery.model";
import { IsArray, IsEmail, IsNotEmpty, IsPhoneNumber, IsString, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";
import { CreatePaymentOptionInput } from "./payment_option.input";
import { PaymentOption } from "../model/payment_option.model";


@InputType()
export class CreateBusinessInput {

    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @IsArray()
    @IsNotEmpty()
    name: LocalizedFieldInput[];

    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @IsArray()
    @IsNotEmpty()
    description?: LocalizedFieldInput[];

    @Field(types => [String])
    @Transform((param) => (param.value as string[]).map(e => e.toUpperCase()))
    @IsArray()
    @IsNotEmpty()
    categories: string[];

    @Field()
    @IsString()
    @IsNotEmpty()
    creator: string;

    @Field(types => AddressInput)
    mainAddress: AddressInput;

    @Field()
    @IsPhoneNumber()
    phoneNumber: string;

    @Field()
    @IsEmail()
    email?: string;

    @Field()
    website?: string;

    @Field(types => GalleryInput)
    gallery: GalleryInput;

    @Field(types => [CreatePaymentOptionInput])
    paymentOptions?: CreatePaymentOptionInput[]





    constructor(partial?: Partial<Business>) {
        Object.assign(this, partial);
    }

    toBusiness(): Business {
        const business = new Business({
            ...this,
            paymentOptions: this.paymentOptions.map(option => PaymentOption.fromCreatePaymentOptionInput(option)),
            stage: BusinessRegistrationStage.BUSINESS_CREATED
        });
        return business;
    }
}


@InputType()
export class UpdateBusinessInput extends PartialType(PickType(CreateBusinessInput, ['name', 'categories', 'description', 'email', 'gallery', 'mainAddress', 'email', 'phoneNumber', 'website', 'paymentOptions'], InputType)) {

    toBusinessInfo(): Business {
        const business = new Business({ ...this });
        return business;
    }
}