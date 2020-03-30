import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserType, Users } from '../types/user/user.type';
import { UserService } from 'src/service/services/user.service';
import {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
} from '../inputs/user/user.input';
import { CurrentUser, Roles } from 'src/common/decorators/decorators';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/common/guards/gql.guard';
import { IPayload } from 'src/common/interfaces/payload.interface';
import { AdminGqlGuard } from 'src/common/guards/role.guard';
import { UserRole } from 'src/entity/user/user.entity';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Mutation(returns => UserType)
  async createUserByAdmin(
    @Args('credentials') input: CreateUserInput,
    @Args('role') role: UserRole,
    @CurrentUser() user: IPayload,
  ) {
    return await this.userService.createUser(input, role, user);
  }

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN)
  @Mutation(returns => UserType)
  async removeUser(@Args('email') email: string) {
    return await this.userService.removeUser(email);
  }

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN)
  @Mutation(returns => UserType)
  async recoverUser(@Args('email') email: string) {
    return await this.userService.recoverUser(email);
  }

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Query(returns => UserType)
  async findOneUser(@Args('email') email: string) {
    return await this.userService.getUserByEmailAddress(email);
  }

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Mutation(returns => Users)
  async findAllUsers(@Args('limit') limit: number, @Args('page') page: number) {
    return await this.userService.findAll(limit, page);
  }

  @Mutation(returns => UserType)
  async verifyUser(@Args('token') token: string) {
    return await this.userService.verifyUserByToken(token);
  }

  @Mutation(returns => UserType)
  async setPasswordResetToken(@Args('email') email: string) {
    return await this.userService.setPasswordResetToken(email);
  }

  @Mutation(returns => UserType)
  async resetPasswordByToken(@Args('input') input: ResetPasswordInput) {
    return await this.userService.resetPasswordByToken(input);
  }

  @Mutation(returns => Boolean)
  async refreshVerificationToken(@Args('email') email: string) {
    return await this.userService.refreshVerificationToken(email);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => UserType)
  async updateUser(
    @Args('input') input: UpdateUserInput,
    @CurrentUser() user: IPayload,
  ) {
    return await this.userService.updateUser(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => UserType)
  async getMe(@CurrentUser() user: IPayload) {
    return await this.userService.getMe(user);
  }
}
