import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from "../model/jwt_payload.model";
import { ACCESS_TOKEN } from "apps/auth/configuration";



@Injectable()
export class AccessTokenStretegy extends PassportStrategy(Strategy, "jwt") {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get(ACCESS_TOKEN),
        })
    }

    validate(payload: JwtPayload) {
        return payload;
    }

}