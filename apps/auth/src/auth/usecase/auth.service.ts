
import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository, UserRepository } from '../data/repo/user.repository';
import { AccountType, User } from '../model/user.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN, REFRESH_TOKEN_EXPIRES_IN } from 'apps/auth/auth_configuration';
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
    let registredUser = await this.emailAuthProvider.createAccount(userInfo)
    let authResponse = await this.tokenGeneratorHelper(registredUser)
    await this.userRepo.updateUserInfo(registredUser.id, { refreshToken: authResponse.refreshToken })
    return {
      ...authResponse,
      isNewUser: true
    }
  }

  async authenticateUsingEmail(authInfo: AuthInfo): Promise<AuthResponse> {
    let authenticatedUser = await this.emailAuthProvider.authenticate(authInfo);
    // generate tokens
    let authResponse = await this.tokenGeneratorHelper(authenticatedUser)
    await this.userRepo.updateUserInfo(authenticatedUser.id, { refreshToken: authResponse.refreshToken })
    // response
    return {
      ...authResponse,
      isNewUser: false,
    }
  }

  async registerOrAuthenticateUsingPhoneNumber(userInfo: User): Promise<AuthResponse> {
    let authTokenKeys = AuthResponse.getEnvVariableForAuth(this.configService)
    let authenticatedUserResult: User;
    //register user by phone first and it user exist authenticate it
    try {
      authenticatedUserResult = await this.phoneAuthProvider.createAccount(userInfo)
      let authResponse = await this.tokenGeneratorHelper(authenticatedUserResult);
      await this.userRepo.updateUserInfo(authenticatedUserResult.id, { refreshToken: authResponse.refreshToken })
      return {
        ...authResponse,
        isNewUser: true
      }
    } catch (error) {
      if (ExceptionHelper.isUserRegisteredBeforeException(error)) {
        authenticatedUserResult = await this.phoneAuthProvider.authenticate({ phoneNumber: userInfo.phoneNumber });
        let authResponse = await this.tokenGeneratorHelper(authenticatedUserResult)
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
    let result = await this.userRepo.updateUserInfo(userId, updateUserInfo)
    return result
  }

  async refreshToken(userInfo: User): Promise<AuthResponse> {
    let authResponse = await this.tokenGeneratorHelper(userInfo)
    let updateTokenResult = await this.userRepo.updateUserInfo(userInfo.id, { refreshToken: authResponse.refreshToken })
    return {
      ...authResponse,
      isNewUser: false
    }
  }

  async tokenGeneratorHelper(user: User): Promise<AuthResponse> {
    let authTokenKeys = AuthResponse.getEnvVariableForAuth(this.configService)
    let generatedAccessToken = await this.jwtService.signAsync(user.getTokenPayloadFromUser(), { secret: authTokenKeys.accessTokenKey, expiresIn: authTokenKeys.accessTokenExpires })
    let generatedRefreshToken = await this.jwtService.signAsync(user.getTokenPayloadFromUser(), { secret: authTokenKeys.refreshTokenKey, expiresIn: authTokenKeys.refreshTokenExpires })
    return {
      success: true,
      user: user,
      accessToken: generatedAccessToken,
      refreshToken: generatedRefreshToken
    }
  }

  async getUserInfo(userId: string): Promise<User | undefined> {
    let userInfo = await this.userRepo.getUser({ id: userId })
    return userInfo
  }

  async logout(userId: string) {
    let result = await this.emailAuthProvider.logout(userId);
    return result;
  }
}
