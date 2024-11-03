import { InputType, PickType } from "@nestjs/graphql";
import { extend } from "lodash";
import { Staff } from "../model/staff.model";
import { IsNumber, IsString, Length, Max, Min } from "class-validator";
import { User } from "apps/auth/src/auth/model/user.model";

@InputType()
export class CreateStaffInput extends PickType(Staff, ['name', 'pin', 'roles', 'phoneNumber', 'password', 'branchId', 'businessId'], InputType) {
    @IsString()
    name: string;
    @IsNumber()
    pin: number;
    roles: string[];

    static toStaff(input: CreateStaffInput): Staff {
        return new Staff({
            name: input.name,
            phoneNumber: input.phoneNumber,
            pin: input.pin,
            password: input.password,
            roles: input.roles,
            branchId: input.branchId,
            businessId: input.businessId
        });
    }




}