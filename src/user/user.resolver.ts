import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { RegisterUserInput } from './dto/register-user.input';
import { User } from './models/user.model';


@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { nullable: true })
  async getUser(@Args('id') id: string): Promise<User | null> {
    const user = await this.userService.findById(id) ;

    return user ? {
      ...user,
      name: user.name === null ? undefined : user.name,
      phoneNumber: user.phoneNumber === null ? undefined : user.phoneNumber,
      pushToken: user.pushToken === null ? undefined : user.pushToken,
    } : null;
  }

  @Mutation(() => User)
  async registerUser(@Args('input') input: RegisterUserInput): Promise<User> {
    const user = await this.userService.registerIfNotExists(input);
    return {
      ...user,
      name: user.name === null ? undefined : user.name,
      phoneNumber: user.phoneNumber === null ? undefined : user.phoneNumber,
      pushToken: user.pushToken === null ? undefined : user.pushToken,
    };
  }
}
