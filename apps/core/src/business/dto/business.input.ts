import { InputType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { Business, BusinessInput, BusinessRegistrationStage } from "../model/business.model";
import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Address, AddressInput } from "../model/address.model";
import { Gallery, GalleryInput } from "../model/gallery.model";
import { IsArray, IsNotEmpty, IsPhoneNumber, IsString, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";

// @InputType()
// export class CreateBusinessInput extends OmitType(Business, ['id', 'stage', 'createdAt', 'openingStatus', 'updatedAt', 'branches', 'isActive', 'creator', 'branchIds', 'branches'], InputType) {
//     @IsNotEmpty()
//     @Type(() => LocalizedFieldInput)
//     name: LocalizedFieldInput[];

//     @IsNotEmpty()
//     @Type(() => LocalizedFieldInput)
//     description?: LocalizedFieldInput[];

//     @Type(() => AddressInput)
//     mainAddress: AddressInput;

//     @Type(() => GalleryInput)
//     gallery: GalleryInput;

//     @IsNotEmpty()
//     creator: string;

//     @IsNotEmpty()
//     @IsArray()
//     @Transform(param => param.value.map((category: string) => category.toUpperCase()))
//     categories: string[];

//     @IsNotEmpty()
//     @IsString()
//     @IsPhoneNumber()
//     phoneNumber: string;

//     toBusiness(): Business {
//         const business = new Business({ ...this, stage: BusinessRegistrationStage.BUSINESS_CREATED });
//         return business;
//     }
// }

@InputType()
export class UpdateBusinessInput extends PartialType(PickType(BusinessInput, ['name', 'categories', 'description', 'email', 'gallery', 'group', 'mainAddress', 'email', 'phoneNumber', 'website'], InputType)) {

    toBusinessInfo(): Business {
        const business = new Business({ ...this });
        return business;
    }
}