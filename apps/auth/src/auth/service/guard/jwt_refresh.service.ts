import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from "../../model/jwt_payload.model";
import { REFRESH_TOKEN } from "apps/auth/configuration";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor(private confitService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: confitService.get(REFRESH_TOKEN),
            passReqToCallback: true,
        })
    }

    validate(req: Request, payload: JwtPayload) {
        const refreshToken = req.headers.get('Authorization').replace('Bearer', '').trim();
        return <JwtPayload>{ ...payload, refreshToken };
    }
}