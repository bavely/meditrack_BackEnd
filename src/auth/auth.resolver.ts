// src/auth/auth.resolver.ts
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserInput } from '../user/dto/register-user.input';
import { LoginResponse } from './models/login-response.model';
import { GqlAuthGuard } from '../common/guards/gql-auth-guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => LoginResponse, { name: 'registerUser' })
  async registerUser(
    @Args('input') input: CreateUserInput,
  ): Promise<LoginResponse> {
    console.log('Registering user:', input);
    // First create the user in your DB:
    await this.auth.register(input);

    // Then immediately log them in:
    return this.auth.login(input.email, input.password);
  }

  @Mutation(() => LoginResponse, { name: 'login' })
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<LoginResponse> {
    return this.auth.login(email, password);
  }

  @Mutation(() => LoginResponse, { name: 'refreshToken' })
  @UseGuards(GqlAuthGuard)
  async refresh(
    @Args('refreshToken') refreshToken: string,
    @Context('req') req: any,
  ): Promise<{ accessToken: string }> {
    // req.user was populated by your JWT guard → contains { userId, email }
    return this.auth.refresh(req.user.userId, refreshToken);
  }

  @Mutation(() => String, { name: 'verifyEmail' })
  verifyEmail(@Args('token') token: string) : Promise<string> {
    return this.auth.verifyEmail(token);
  }

  @Mutation(() => String, { name: 'resendVerificationEmail' })
  async resendVerificationEmail(@Args('token') token: string) : Promise<string>  { return this.auth.requestNewEmailVerification(token); }

  @Mutation(() => String, { name: 'forgotPassword' })
  async forgotPassword(@Args('email') email: string): Promise<string> {
    return this.auth.requestPasswordReset(email);
  }

  @Mutation(() => String, { name: 'resetPassword' })
  async resetPassword(
    @Args('token') token: string,
    @Args('password') password: string,
  ): Promise<string> {
    return this.auth.resetPassword(token, password);
  }


}
