import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {GqlAuthGuard } from "../common/guards/gql-auth-guard"
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserResponse } from './dto/user-response';
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserResponse, { name: 'getUser' })
  @UseGuards(GqlAuthGuard)
  async getUser(@CurrentUser() user) {
    console.log('Current user:', user);
    if (!user) {
      throw new Error('User not found');
    }

    

    const userData = await this.userService.findById(user.sub);
console.log('User data:', userData);
     return {
        success: true,
        errors: [],
        data: userData,

      };
    
  }

 
}
