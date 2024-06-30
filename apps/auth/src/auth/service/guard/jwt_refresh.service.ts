import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from "../../model/jwt_payload.model";
import { REFRESH_TOKEN } from "apps/auth/auth_configuration";
import { IUserRepository, UserRepository } from "../../data/repo/user.repository";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { User } from "../../model/user.model";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor(private confitService: ConfigService, @Inject(UserRepository.injectName) private userRepo: IUserRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: confitService.get(REFRESH_TOKEN),
            passReqToCallback: true,
        })
    }

    async validate(req: Request, payload: JwtPayload): Promise<User> {
        const refreshToken = req.headers['authorization'].replace('Bearer', '').trim();
        if (!refreshToken) {
            throw new RequestValidationException({ message: "unknown refresh token", statusCode: 400 })
        }
        var userByRefreshToken = await this.userRepo.getUser({ refreshToken: payload.refreshToken })
        if (!userByRefreshToken.id) {
            throw new RequestValidationException({ message: "User not found by this refresh token", statusCode: 400 })
        }
        return userByRefreshToken
    }
}