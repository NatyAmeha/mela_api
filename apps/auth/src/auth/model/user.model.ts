import { BaseModel } from "@app/common/model/base.model";
import { Field, ID, Int, InterfaceType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { SignupInput } from "../dto/signup.input";
import { AccountStatus } from "./account_status.enum";
import { JwtPayload } from "./jwt_payload.model";
import { Access } from "../../authorization/model/access.model";

@ObjectType()
export class User extends BaseModel {
    @Field(type => ID)
    id?: string
    @Field()
    email?: string
    @Field()
    phoneNumber?: string
    @Field()
    username?: string
    isUsernamePlaceholder?: boolean
    @Field()
    password?: string
    @Field()
    firstName?: string
    @Field()
    lastName?: string
    @Field()
    profileImageUrl?: string
    @Field()
    refreshToken?: string
    @Field()
    accountStatus?: string
    @Field()
    isEmailPlaceholder?: boolean = false
    @Field()
    emailVerified?: boolean = false
    @Field()
    phoneVerified?: boolean = false
    @Field(type => [Access])
    accesses?: Access[]
    @Field(type => [String])
    accessIds?: string[]



    constructor(data: Partial<User>) {
        super();
        Object.assign(this, data)
    }

    static createUserFromSignupInfo(signupInfo: SignupInput) {
        return new User({
            email: signupInfo.email, phoneNumber: signupInfo.phoneNumber, firstName: signupInfo.firstName, lastName: signupInfo.lastName,
            password: signupInfo.password, profileImageUrl: signupInfo.profileImageUrl,
            accountStatus: AccountStatus.PENDING
        })
    }

    static createUserInfoForPhoneAuth(phone: string) {
        return new User({
            phoneNumber: phone,
            isEmailPlaceholder: true
        })
    }

    getTokenPayloadFromUser(): JwtPayload {
        return {
            sub: this.id,
            username: this.email
        }
    }
}
