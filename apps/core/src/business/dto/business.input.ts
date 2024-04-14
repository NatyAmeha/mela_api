import { InputType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { Business, BusinessRegistrationStage } from "../model/business.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { Address } from "../model/address.model";
import { Gallery } from "../model/gallery.model";
import { IsArray, IsNotEmpty, IsPhoneNumber, IsString, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";

@InputType()
export class CreateBusinessInput extends OmitType(Business, ['id', 'stage', 'createdAt', 'openingStatus', 'updatedAt', 'branches', 'isActive', 'creator', 'branchIds', 'branches'], InputType) {
    @IsNotEmpty()
    @Type(() => LocalizedData)
    name: LocalizedData[];

    @IsNotEmpty()
    @Type(() => LocalizedData)
    description?: LocalizedData[];

    @Type(() => Address)
    mainAddress: Address;

    @Type(() => Gallery)
    gallery: Gallery;

    @IsNotEmpty()
    creator: string;

    @IsNotEmpty()
    @IsArray()
    @Transform(param => param.value.map((category: string) => category.toUpperCase()))
    categories: string[];

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber()
    phoneNumber: string;

    toBusiness(): Business {
        const business = new Business({ ...this, stage: BusinessRegistrationStage.BUSINESS_CREATED });
        return business;
    }
}

@InputType()
export class UpdateBusinessInput extends PartialType(PickType(CreateBusinessInput, ['name', 'categories', 'description', 'email', 'gallery', 'group', 'mainAddress', 'email', 'phoneNumber', 'website'], InputType)) {

    toBusinessInfo(): Business {
        const business = new Business({ ...this });
        return business;
    }
}