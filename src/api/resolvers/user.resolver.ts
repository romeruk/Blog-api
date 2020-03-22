import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserType } from '../types/user/user.type';
import { UserService } from 'src/service/services/user.service';
import {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
} from '../inputs/user/user.input';
import { CurrentUser } from 'src/common/decorators/decorators';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/common/guards/gql.guard';
import { IPayload } from 'src/common/interfaces/payload.interface';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

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
  async resetPasswordByToken(@Args('input') input: ResetPasswordInput) {
    return await this.userService.resetPasswordByToken(input);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => UserType)
  async updateUser(
    @Args('input') input: UpdateUserInput,
    @CurrentUser() user: IPayload,
  ) {
    return await this.userService.updateUser(input, user);
  }
}
