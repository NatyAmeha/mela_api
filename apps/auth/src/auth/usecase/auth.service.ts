
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
import { PhoneAuthProvder } from '../service/auth_provider/phone_auth_provider';
import { ExceptionHelper } from '@app/common/errors/exception_helper';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserRepository.injectName) private userRepo: IUserRepository,
    @Inject(EmailAuthProvider.injectName) private emailAuthProvider: IAuthProvider,
    @Inject(PhoneAuthProvder.injectName) private phoneAuthProvider: IAuthProvider,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }
  async createUserAccountUsingEmailPassword(userInfo: User) {
    var registredUser = await this.emailAuthProvider.createAccount(userInfo)
    // get auth constants from env
    var authTokenKeys = AuthResponse.getEnvVariableForAuth(this.configService)
    // generate tokens
    var generatedAccessToken = await this.jwtService.signAsync(registredUser.getTokenPayloadFromUser(), { secret: authTokenKeys.accessTokenKey, expiresIn: authTokenKeys.accessTokenExpires })
    var generatedRefreshToken = await this.jwtService.signAsync(registredUser.getTokenPayloadFromUser(), { secret: authTokenKeys.refreshTokenKey, expiresIn: authTokenKeys.refreshTokenExpires })
    await this.userRepo.updateRefreshToken(registredUser.id, generatedAccessToken)
    // response
    return {
      user: registredUser,
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken,
      isNewUser: true
    }
  }

  async authenticateUsingEmail(authInfo: AuthInfo): Promise<AuthResponse> {
    var authenticatedUser = await this.emailAuthProvider.authenticate(authInfo);
    // generate tokens
    var authTokenKeys = AuthResponse.getEnvVariableForAuth(this.configService)
    var generatedAccessToken = await this.jwtService.signAsync(authenticatedUser.getTokenPayloadFromUser(), { secret: authTokenKeys.accessTokenKey, expiresIn: authTokenKeys.accessTokenExpires })
    var generatedRefreshToken = await this.jwtService.signAsync(authenticatedUser.getTokenPayloadFromUser(), { secret: authTokenKeys.refreshTokenKey, expiresIn: authTokenKeys.refreshTokenExpires })
    var updateTokenResult = await this.userRepo.updateRefreshToken(authenticatedUser.id, generatedAccessToken)
    // response
    return {
      user: authenticatedUser,
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken,
      isNewUser: false,
    }
  }

  async registerOrAuthenticateUsingPhoneNumber(userInfo: User): Promise<AuthResponse> {
    var authTokenKeys = AuthResponse.getEnvVariableForAuth(this.configService)
    var authenticatedUserResult: User;
    //register user by phone first and it user exist authenticate it
    try {
      authenticatedUserResult = await this.phoneAuthProvider.createAccount(userInfo)
      var generatedAccessToken = await this.jwtService.signAsync(authenticatedUserResult.getTokenPayloadFromUser(), { secret: authTokenKeys.accessTokenKey, expiresIn: authTokenKeys.accessTokenExpires })
      var generatedRefreshToken = await this.jwtService.signAsync(authenticatedUserResult.getTokenPayloadFromUser(), { secret: authTokenKeys.refreshTokenKey, expiresIn: authTokenKeys.refreshTokenExpires })
      await this.userRepo.updateRefreshToken(authenticatedUserResult.id, generatedAccessToken)
      return {
        user: authenticatedUserResult,
        accessToken: generatedAccessToken,
        refreshToken: generatedRefreshToken,
        isNewUser: true
      }
    } catch (error) {
      if (ExceptionHelper.isUserRegisteredBeforeException(error)) {
        authenticatedUserResult = await this.phoneAuthProvider.authenticate({ phoneNumber: userInfo.phoneNumber });
        var generatedAccessToken = await this.jwtService.signAsync(authenticatedUserResult.getTokenPayloadFromUser(), { secret: authTokenKeys.accessTokenKey, expiresIn: authTokenKeys.accessTokenExpires })
        var generatedRefreshToken = await this.jwtService.signAsync(authenticatedUserResult.getTokenPayloadFromUser(), { secret: authTokenKeys.refreshTokenKey, expiresIn: authTokenKeys.refreshTokenExpires })
        await this.userRepo.updateRefreshToken(authenticatedUserResult.id, generatedAccessToken)
        return {
          user: authenticatedUserResult,
          accessToken: generatedAccessToken,
          refreshToken: generatedRefreshToken,
          isNewUser: false
        }
      }
      else {
        throw error;
      }
    }
  }


}
