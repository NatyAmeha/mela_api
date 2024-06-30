import { InputType, PickType } from "@nestjs/graphql";
import { extend } from "lodash";
import { Staff } from "../model/staff.model";
import { IsNumber, IsString, Length } from "class-validator";

@InputType()
export class CreateStaffInput extends PickType(Staff, ['name', 'pin', 'roles', 'branchId', 'businessId'], InputType) {
    @IsString()
    name: string;
    @IsNumber()
    @Length(4)
    pin: number;
    roles: string[];
} 