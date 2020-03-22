import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { Response } from 'express';
import { ResGql, isAdminAccess } from '../../common/decorators/decorators';
import { UseGuards } from '@nestjs/common';
import { AuthService } from 'src/service/services/auth.service';
import { UserLogInInput } from '../inputs/user/user.input';
import { UserType } from '../types/user/user.type';
import { GqlAuthGuard } from 'src/common/guards/gql.guard';
import { AdminGqlGuard } from 'src/common/guards/role.guard';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @isAdminAccess(true)
  @Query(returns => String)
  hello() {
    return '123';
  }

  @Mutation(returns => UserType)
  async logIn(
    @Args('credentials') input: UserLogInInput,
    @ResGql() res: Response,
  ) {
    const result = await this.authService.logIn(input, res);
    return result;
  }
}
