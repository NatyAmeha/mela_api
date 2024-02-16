
import { Catch, Inject, Injectable } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SignupInput } from '../dto/signup.input';
import { IUserRepository, UserRepository } from '../data/repo/user.repository';
import { User } from '../model/user.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES_IN } from 'apps/auth/configuration';
import { AuthResponse } from '../model/auth.response';
import { RequestValidationException } from '@app/common/errors/request_validation_exception';
import { AuthSecurityService, IAuthSecurityService } from '../service/auth_security.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserRepository.injectName) private userRepo: IUserRepository,
    @Inject(AuthSecurityService.injectName) private securityService: IAuthSecurityService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }
  async createUserAccount(userInfo: User) {
    var accessTokenKey = this.configService.get<string>(ACCESS_TOKEN);
    var refreshTokenKey = this.configService.get<string>(REFRESH_TOKEN);
    var accessTokenExpires = this.configService.get<string>(ACCESS_TOKEN_EXPIRES_IN);
    var refreshTokenExpires = this.configService.get<string>(REFRESH_TOKEN_EXPIRES_IN);
    var isUserRegisteredBefore = await this.userRepo.isUserRegisteredBefore(userInfo.email)
    if (isUserRegisteredBefore) {
      throw new RequestValidationException({ message: "User already exist", statusCode: 400 })
    }
    if (userInfo.password) {
      var hashedPassword = await this.securityService.hashPassword(userInfo.password);
      userInfo.password = hashedPassword;
    }
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
