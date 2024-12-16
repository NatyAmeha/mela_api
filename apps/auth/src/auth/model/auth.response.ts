import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "./user.model";
import { ConfigService } from "@nestjs/config";
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES_IN } from "apps/auth/auth_configuration";
import { BaseResponse } from "@app/common/model/base.response";
import { Access } from "../../authorization/model/access.model";

@ObjectType()
export class AuthResponse extends BaseResponse {

    @Field(type => User)
    user?: User
    @Field()
    accessToken?: string
    @Field()
    refreshToken?: string
    @Field()
    isNewUser?: boolean
    @Field(types => [Access])
    accesses?: Access[]

    constructor(data: Partial<AuthResponse>) {
        super()
        Object.assign(this, data)
    }

    isUserExist() {
        return this.user && this.user.id
    }

    static getEnvVariableForAuth(configService: ConfigService) {
        var accessTokenKey = configService.get<string>(ACCESS_TOKEN);
        var refreshTokenKey = configService.get<string>(REFRESH_TOKEN);
        var accessTokenExpires = configService.get<string>(ACCESS_TOKEN_EXPIRES_IN);
        var refreshTokenExpires = configService.get<string>(REFRESH_TOKEN_EXPIRES_IN);
        return {
            accessTokenKey, refreshTokenKey, accessTokenExpires, refreshTokenExpires
        }
    }
}