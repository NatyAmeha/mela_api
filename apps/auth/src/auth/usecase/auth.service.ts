
import { Catch, Inject, Injectable } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SignupInput } from '../dto/signup.input';
import { IUserRepository, UserRepository } from '../user.repository';
import { User } from '../model/user.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES_IN } from 'apps/auth/configuration';
import { AuthResponse } from '../model/auth.response';

@Injectable()
export class AuthService {
  constructor(@Inject(UserRepository.injectName) private userRepo: IUserRepository, private jwtService: JwtService, private configService: ConfigService) {

  }
  async createUserAccount(userInfo: User) {
    var accessTokenKey = this.configService.get<string>(ACCESS_TOKEN);
    var refreshTokenKey = this.configService.get<string>(REFRESH_TOKEN);
    var accessTokenExpires = this.configService.get<string>(ACCESS_TOKEN_EXPIRES_IN);
    var refreshTokenExpires = this.configService.get<string>(REFRESH_TOKEN_EXPIRES_IN);

    var userResult = await this.userRepo.createUser(userInfo)

    var generatedAccessToken = await this.jwtService.signAsync(userResult.getTokenPayloadFromUser(), { secret: accessTokenKey, expiresIn: accessTokenExpires })
    var generatedRefreshToken = await this.jwtService.signAsync(userResult.getTokenPayloadFromUser(), { secret: refreshTokenKey, expiresIn: refreshTokenExpires })

    var updateTokenResult = await this.userRepo.updateRefreshToken(userResult.id, generatedAccessToken)
    return <AuthResponse>{
      user: userResult,
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken
    }
  }


}
