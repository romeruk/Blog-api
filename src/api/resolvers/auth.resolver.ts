import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Response } from 'express';
import { ResGql } from '../../common/decorators/decorators';
import { UseGuards } from '@nestjs/common';
import { AuthService } from 'src/service/services/auth.service';
import { UserLogInInput, CreateUserInput } from '../inputs/user/user.input';
import { UserType } from '../types/user/user.type';
import { GqlAuthGuard } from 'src/common/guards/gql.guard';
import { UserService } from 'src/service/services/user.service';

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Mutation(returns => UserType)
  async register(@Args('credentials') input: CreateUserInput) {
    return await this.userService.createUser(input);
  }

  @Mutation(returns => UserType)
  async logIn(
    @Args('credentials') input: UserLogInInput,
    @ResGql() res: Response,
  ) {
    const result = await this.authService.logIn(input, res);
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logOut(@ResGql() res: Response) {
    res.clearCookie('token');
    return true;
  }
}
