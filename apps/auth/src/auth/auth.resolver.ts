import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.model';
import { EmailAuthArgs } from './dto/email_auth_args.dto';

@Resolver(of => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Query(returns => User, { name: "me" })
  getUser(@Args() emailDto: EmailAuthArgs): User {
    return new User({ email: emailDto.email, password: this.authService.getHello() });
  }

  @Query(returns => String, { name: "token", nullable: true })
  getAuthToken(): String {
    return "fake jwt token"
  }
}
