// src/auth/auth.resolver.ts
import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserInput } from '../user/dto/register-user.input';
import {RefreshResponse} from './dto/refresh-response.dto';
import { GqlAuthGuard } from '../common/guards/gql-auth-guard';
import {AuthResponse} from './dto/register-user.input'; // Assuming this is the correct import path
import {VerificationsResponse} from './dto/verificatins-response'
@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'registerUser' })
  async registerUser(
    @Args('input') input: CreateUserInput,
  ): Promise<AuthResponse> {
    console.log('Registering user:', input);
    // First create the user in your DB:
    await this.auth.register(input);

    // Then immediately log them in:
  const { accessToken, refreshToken, user } = await this.auth.login(input.email, input.password);

        return {
        success: true,
        errors: [],
        data: {
          accessToken,
          refreshToken,
          user,
        },
      };

   
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthResponse> {
     const { accessToken, refreshToken, user } = await this.auth.login(email, password);

    return {
      success: true,
      errors: [],
      data: {
        accessToken,
        refreshToken,
        user,
      },
    };
  }

  @Mutation(() => RefreshResponse, { name: 'refreshToken' })
  @UseGuards(GqlAuthGuard)
  async refresh(
    @Args('refreshToken') refreshToken: string,
    @Context('req') req: any,
  ): Promise<RefreshResponse> {
    // req.user was populated by your JWT guard → contains { userId, email }
    const { accessToken } = await this.auth.refresh(req.user.userId, refreshToken);

    return {
      success: true,
      errors: [],
      data: {
        accessToken,
      },
    };

  }

  @Mutation(() => VerificationsResponse, { name: 'verifyEmail' })
  async verifyEmail(@Args('token') token: string) : Promise<VerificationsResponse> {
    const result = await this.auth.verifyEmail(token);

return {
  success: true,
  errors: [],
  data: {
    message: result,
  },
};
  }

  @Mutation(() => VerificationsResponse, { name: 'resendVerificationEmail' })
  async resendVerificationEmail(@Args('token') token: string) : Promise<VerificationsResponse>  { 
    const result = await this.auth.requestNewEmailVerification(token);
  
    return {
      success: true,
      errors: [],
      data: {
        message: result,
      },
    };
  }

  @Mutation(() => VerificationsResponse, { name: 'forgotPassword' })
  async forgotPassword(@Args('email') email: string): Promise<VerificationsResponse> {
    const result = await this.auth.requestPasswordReset(email);

    return {
      success: true,
      errors: [],
      data: {
        message: result,
      },
    };
  }

  @Mutation(() => VerificationsResponse, { name: 'resetPassword' })
  async resetPassword(
    @Args('token') token: string,
    @Args('password') password: string,
  ): Promise<VerificationsResponse> {
    const result = await this.auth.resetPassword(token, password);

    return {
      success: true,
      errors: [],
      data: {
        message: result,
      },
    };
  }


}
