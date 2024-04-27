import { Field, InputType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { Branch } from "../model/branch.model";
import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Address, AddressInput } from "../../business/model/address.model";
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

@InputType()
export class CreateBranchInput {
    @Field(type => [LocalizedFieldInput])
    @IsNotEmpty()
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[];

    @Field(type => AddressInput)
    @IsNotEmpty()
    @Type(() => AddressInput)
    address: Address;

    @Field()
    @IsNotEmpty()
    @IsPhoneNumber()
    phoneNumber: string;

    @Field()
    email?: string;

    toBranch(businessId: string): Branch {
        const branch = new Branch({ ...this, businessId: businessId });
        return branch;
    }
}

@InputType()
export class UpdateBranchInput extends PartialType(CreateBranchInput, InputType) {
    toBranchInfo(): Branch {
        const branch = new Branch({ ...this });
        return branch;
    }
}