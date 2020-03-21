import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserType } from '../types/user/user.type';
import { UserService } from 'src/service/services/user.service';
import { CreateUserInput, resetPasswordInput } from '../inputs/user/user.input';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(returns => String)
  hello() {
    return '123';
  }

  @Mutation(returns => UserType)
  async register(@Args('credentials') input: CreateUserInput) {
    const user = await this.userService.createUser(input);
    return user;
  }

  @Mutation(returns => UserType)
  async verifyUser(@Args('token') token: string) {
    const user = await this.userService.verifyUserByToken(token);
    return user;
  }

  @Mutation(returns => UserType)
  async setPasswordResetToken(@Args('email') email: string) {
    const user = await this.userService.setPasswordResetToken(email);
    return user;
  }

  @Mutation(returns => UserType)
  async resetPasswordByToken(@Args('input') input: resetPasswordInput) {
    const user = await this.userService.resetPasswordByToken(input);
    return user;
  }
}
