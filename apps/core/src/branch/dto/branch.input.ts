import { Field, InputType, OmitType, PartialType, PickType } from "@nestjs/graphql";
import { Branch } from "../model/branch.model";
import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Address, AddressInput } from "../../business/model/address.model";
import { IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

@InputType()
export class CreateBranchInput {
    @Field(type => [LocalizedFieldInput])
    @IsNotEmpty()
    @Type(() => LocalizedFieldInput)
    name: LocalizedFieldInput[];

    @IsNotEmpty()
    @Field(type => AddressInput)
    @Type(() => AddressInput)
    address: Address;

    @Field()
    @IsNotEmpty()
    @IsString()
    businessId: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @Field()
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