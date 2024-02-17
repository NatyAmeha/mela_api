import { Controller, Get, Logger, UseFilters } from '@nestjs/common';
import { AuthService } from './usecase/auth.service';
import { Args, InputType, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './model/user.model';

import { SignupInput } from './dto/signup.input';
import { AuthResponse } from './model/auth.response';
import { AppException } from '@app/common/errors/app_exception.model';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { SecurityException } from '@app/common/errors/security_exception';
import { AuthInfo } from './dto/auth_info.args';

@Resolver(of => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Query(returns => User, { name: "me" })
  getUser(): User {
    return new User({ email: "Natnael" });
  }

  @Mutation(returns => AuthResponse)
  async createUserAccountUsingEmailPassword(@Args("signup") signupInfo: SignupInput): Promise<AuthResponse | AppException> {
    var userInfo = User.createUserFromSignupInfo(signupInfo);
    var result = await this.authService.createUserAccountUsingEmailPassword(userInfo);
    return result;
  }


  @Mutation(returns => AuthResponse)
  async signInWithEmailAndPassword(@Args("email") email: string, @Args("password") password: string): Promise<AuthResponse> {
    var authResponse = await this.authService.authenticateUsingEmail({ email, password });
    return authResponse;
  }

  @Mutation(returns => AuthResponse)
  async signInWithPhoneNumber(@Args("phone") phone: string): Promise<AuthResponse> {
    var userInfo = User.createUserInfoForPhoneAuth(phone)
    var authResponse = await this.authService.registerOrAuthenticateUsingPhoneNumber(userInfo);
    return authResponse;
  }
}
