import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsOptional, IsPhoneNumber, IsString, } from "class-validator";
import { AccountType, User } from "../model/user.model";
import { AccountStatus } from "../model/account_status.enum";

@InputType()
export class SignupInput {
    @Field()
    @IsOptional()
    @IsEmail()
    email?: string
    @Field()
    @IsOptional()
    @IsString()
    phoneNumber?: string
    @Field()
    @IsOptional()
    password?: string
    @Field()
    @IsOptional()
    firstName?: string
    @Field()
    @IsOptional()
    lastName?: string

    @Field()
    @IsOptional()
    googleId?: string
    @Field()
    @IsOptional()
    profileImageUrl?: string

    createUserFromSignupInfo() {
        return new User({
            email: this.email, phoneNumber: this.phoneNumber, firstName: this.firstName, lastName: this.lastName,
            password: this.password, profileImageUrl: this.profileImageUrl,
            accountStatus: AccountStatus.PENDING
        })
    }
}
@InputType()
export class AdminSignUpInput extends SignupInput {
    createUserFromSignupInfo(): User {
        return new User({
            email: this.email, phoneNumber: this.phoneNumber, firstName: this.firstName, lastName: this.lastName,
            password: this.password, profileImageUrl: this.profileImageUrl,
            accountStatus: AccountStatus.PENDING,
            accountType: AccountType.ADMIN
        })
    }
}