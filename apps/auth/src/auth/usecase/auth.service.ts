
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
import { RequestValidationException } from '@app/common/errors/request_validation_exception';

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
    var authResponse = await this.tokenGeneratorHelper(registredUser)
    await this.userRepo.updateUserInfo(registredUser.id, { refreshToken: authResponse.refreshToken })
    return {
      ...authResponse,
      isNewUser: true
    }
  }

  async authenticateUsingEmail(authInfo: AuthInfo): Promise<AuthResponse> {
    var authenticatedUser = await this.emailAuthProvider.authenticate(authInfo);
    // generate tokens
    var authResponse = await this.tokenGeneratorHelper(authenticatedUser)
    await this.userRepo.updateUserInfo(authenticatedUser.id, { refreshToken: authResponse.refreshToken })
    // response
    return {
      ...authResponse,
      isNewUser: false,
    }
  }

  async registerOrAuthenticateUsingPhoneNumber(userInfo: User): Promise<AuthResponse> {
    var authTokenKeys = AuthResponse.getEnvVariableForAuth(this.configService)
    var authenticatedUserResult: User;
    //register user by phone first and it user exist authenticate it
    try {
      authenticatedUserResult = await this.phoneAuthProvider.createAccount(userInfo)
      var authResponse = await this.tokenGeneratorHelper(authenticatedUserResult);
      await this.userRepo.updateUserInfo(authenticatedUserResult.id, { refreshToken: authResponse.refreshToken })
      return {
        ...authResponse,
        isNewUser: true
      }
    } catch (error) {
      if (ExceptionHelper.isUserRegisteredBeforeException(error)) {
        authenticatedUserResult = await this.phoneAuthProvider.authenticate({ phoneNumber: userInfo.phoneNumber });
        var authResponse = await this.tokenGeneratorHelper(authenticatedUserResult)
        await this.userRepo.updateUserInfo(authenticatedUserResult.id, { refreshToken: authResponse.refreshToken })
        return {
          ...authResponse,
          isNewUser: false
        }
      }
      else {
        throw error;
      }
    }
  }

  async updateUserInfo(userId: string, updateUserInfo: User): Promise<boolean> {
    var result = await this.userRepo.updateUserInfo(userId, updateUserInfo)
    return result
  }

  async refreshToken(userInfo: User): Promise<AuthResponse> {
    var authResponse = await this.tokenGeneratorHelper(userInfo)
    var updateTokenResult = await this.userRepo.updateUserInfo(userInfo.id, { refreshToken: authResponse.refreshToken })
    return {
      ...authResponse,
      isNewUser: false
    }
  }

  async tokenGeneratorHelper(user: User): Promise<AuthResponse> {
    var authTokenKeys = AuthResponse.getEnvVariableForAuth(this.configService)
    var generatedAccessToken = await this.jwtService.signAsync(user.getTokenPayloadFromUser(), { secret: authTokenKeys.accessTokenKey, expiresIn: authTokenKeys.accessTokenExpires })
    var generatedRefreshToken = await this.jwtService.signAsync(user.getTokenPayloadFromUser(), { secret: authTokenKeys.refreshTokenKey, expiresIn: authTokenKeys.refreshTokenExpires })
    return {
      user: user,
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken
    }
  }

  async logout(userId: string) {
    var result = await this.emailAuthProvider.logout(userId);
    return result;
  }
}
