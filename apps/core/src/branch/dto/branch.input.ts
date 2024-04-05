import { InputType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { Branch } from "../model/branch.model";
import { LocalizedData } from "@app/common/model/localized_model";
import { Address } from "../../business/model/address.model";
import { IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

@InputType()
export class CreateBranchInput extends PickType(Branch, ['name', 'address', 'businessId', 'phoneNumber', 'email'], InputType) {
    @IsNotEmpty()
    @Type(() => LocalizedData)
    name: LocalizedData[];
    @IsNotEmpty()
    @Type(() => Address)
    address: Address;
    @IsNotEmpty()
    @IsString()
    businessId: string;
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    email?: string;

    toBranch(): Branch {
        const branch = new Branch({ ...this });
        return branch;
    }
}

@InputType()
export class UpdateBranchInput extends OmitType(PartialType(CreateBranchInput), ['businessId'], InputType) {
    toBranchInfo(): Branch {
        const branch = new Branch({ ...this });
        return branch;
    }
}