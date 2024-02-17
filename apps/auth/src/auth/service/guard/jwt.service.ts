import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from "../../model/jwt_payload.model";
import { ACCESS_TOKEN } from "apps/auth/configuration";
import { IUserRepository, UserRepository } from "../../data/repo/user.repository";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";



@Injectable()
export class AccessTokenStretegy extends PassportStrategy(Strategy, "jwt") {
    constructor(private configService: ConfigService, @Inject(UserRepository.injectName) private userRepo: IUserRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get(ACCESS_TOKEN),
        })
    }

    async validate(payload: JwtPayload) {
        if (payload.sub) {
            var userResult = await this.userRepo.getUser({ id: payload.sub })
            if (userResult) {
                return userResult;
            }
        }
        throw new RequestValidationException({ message: "Unauthorized error", statusCode: 401 })
    }

} 