import { Controller, Get, Logger } from '@nestjs/common';
import { AuthService } from './usecase/auth.service';
import { Args, InputType, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './model/user.model';

import { SignupInput } from './dto/signup.input';
import { AuthResponse } from './model/auth.response';

@Resolver(of => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Query(returns => User, { name: "me" })
  getUser(): User {
    return new User({ email: "Natnael" });
  }

  @Mutation(returns => AuthResponse)
  async createUserAccount(@Args("signup") signupInfo: SignupInput): Promise<AuthResponse> {
    // register user account with pending status
    // create refreshtoken, auth token
    var userInfo = User.createUserFromSignupInfo(signupInfo);
    var result = await this.authService.createUserAccount(userInfo);
    return result;
  }

}
