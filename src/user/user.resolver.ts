import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './models/user.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {GqlAuthGuard } from "../common/guards/gql-auth-guard"
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { name: 'getUser' })
  @UseGuards(GqlAuthGuard)
  async getUser(@CurrentUser() user) {
    console.log('Current user:', user);
    if (!user) {
      throw new Error('User not found');
    }

    

    return await this.userService.findById(user.sub);
    
  }

 
}
