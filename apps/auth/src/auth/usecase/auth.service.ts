
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, UserRepository } from '../data/repo/user.repository';
import { User } from '../model/user.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES_IN } from 'apps/auth/configuration';
import { AuthResponse } from '../model/auth.response';
import { AuthInfo } from '../dto/auth_info.args';
import { EmailAuthProvider } from '../service/auth_provider/email_auth_provider';
import { IAuthProvider } from '../service/auth_provider/Iauth_provider.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserRepository.injectName) private userRepo: IUserRepository,
    @Inject(EmailAuthProvider.injectName) private emailAuthProvider: IAuthProvider,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }
  async createUserAccount(userInfo: User) {
    var registredUser = await this.emailAuthProvider.createAccount(userInfo)
    // get auth constants from env
    var accessTokenKey = this.configService.get<string>(ACCESS_TOKEN);
    var refreshTokenKey = this.configService.get<string>(REFRESH_TOKEN);
    var accessTokenExpires = this.configService.get<string>(ACCESS_TOKEN_EXPIRES_IN);
    var refreshTokenExpires = this.configService.get<string>(REFRESH_TOKEN_EXPIRES_IN);
    // generate tokens
    var generatedAccessToken = await this.jwtService.signAsync(registredUser.getTokenPayloadFromUser(), { secret: accessTokenKey, expiresIn: accessTokenExpires })
    var generatedRefreshToken = await this.jwtService.signAsync(registredUser.getTokenPayloadFromUser(), { secret: refreshTokenKey, expiresIn: refreshTokenExpires })
    await this.userRepo.updateRefreshToken(registredUser.id, generatedAccessToken)
    // response
    return <AuthResponse>{
      user: registredUser,
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken
    }
  }

  async authenticateUsingEmail(authInfo: AuthInfo): Promise<AuthResponse> {
    var authenticatedUser = await this.emailAuthProvider.authenticate(authInfo);
    // get constants
    var accessTokenKey = this.configService.get<string>(ACCESS_TOKEN);
    var refreshTokenKey = this.configService.get<string>(REFRESH_TOKEN);
    var accessTokenExpires = this.configService.get<string>(ACCESS_TOKEN_EXPIRES_IN);
    var refreshTokenExpires = this.configService.get<string>(REFRESH_TOKEN_EXPIRES_IN);
    // generate token
    var generatedAccessToken = await this.jwtService.signAsync(authenticatedUser.getTokenPayloadFromUser(), { secret: accessTokenKey, expiresIn: accessTokenExpires })
    var generatedRefreshToken = await this.jwtService.signAsync(authenticatedUser.getTokenPayloadFromUser(), { secret: refreshTokenKey, expiresIn: refreshTokenExpires })
    var updateTokenResult = await this.userRepo.updateRefreshToken(authenticatedUser.id, generatedAccessToken)
    // response
    return <AuthResponse>{
      user: authenticatedUser,
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken
    }

  }


}
