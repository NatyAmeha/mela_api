import { BaseModel } from "@app/common/model/base.model";
import { Directive, Field, ID, InputType, Int, InterfaceType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { SignupInput } from "../dto/signup.input";
import { AccountStatus } from "./account_status.enum";
import { JwtPayload } from "./jwt_payload.model";
import { Access } from "../../authorization/model/access.model";
import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

export enum AccountType {
    USER = "USER",
    ADMIN = "ADMIN",
    SUPERADMIN = "SUPPERADMIN"
}

registerEnumType(AccountType, {
    name: 'AccountType',
    description: 'The account type'
});

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
    @Field()
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
    @Field(type => AccountType, { defaultValue: AccountType.USER })
    accountType: string
    @Field(type => [FavoriteBusinessInfo], { defaultValue: [] })
    favoriteBusinesses?: FavoriteBusinessInfo[]



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
            username: this.email,
            accesses: this.accesses,
            email: this.email
        }
    }

    getFavoriteBusinessIds(): string[] {
        return this.favoriteBusinesses.map(business => business.businessId)
    }
}

@ObjectType()
@Directive('@key(fields: "id, businessId, businessName{key,value}, image ")')
export class FavoriteBusinessInfo {
    @Field(() => ID)
    id: string;
    businessId: string
    @Field(type => [LocalizedField])
    businessName: LocalizedField[]
    image?: string
    constructor(data: Partial<FavoriteBusinessInfo>) {
        Object.assign(this, data)
    }

    static createFavoriteBusinessInfoFromInput(input: FavoriteBusienssInput): FavoriteBusinessInfo {
        return new FavoriteBusinessInfo({ ...input })
    }
}

@InputType()
export class FavoriteBusienssInput {
    @IsString()
    businessId: string
    @Type(() => LocalizedFieldInput)
    @IsNotEmpty()
    businessName: LocalizedFieldInput[]
    image?: string
}


