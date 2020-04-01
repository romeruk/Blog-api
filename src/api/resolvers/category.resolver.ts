import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/common/guards/gql.guard';
import { AdminGqlGuard } from 'src/common/guards/role.guard';
import { CategoryService } from 'src/service/services/category.service';
import { CategoryType, Categories } from '../types/category/category.type';
import {
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../inputs/category/category.input';
import { Roles } from 'src/common/decorators/decorators';
import { UserRole } from 'src/entity/user/user.entity';

@Resolver('Category')
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(returns => Categories)
  async findAllCategories(
    @Args('limit') limit: number,
    @Args('page') page: number,
  ) {
    return this.categoryService.findAll(limit, page);
  }

  @Query(returns => CategoryType)
  async findOneByTitle(@Args('title') title: string) {
    return this.categoryService.findOne(title);
  }

  @Query(returns => CategoryType)
  async findOneBySlug(@Args('slug') slug: string) {
    return this.categoryService.findOneBySlug(slug);
  }

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Mutation(returns => CategoryType)
  async createCategory(@Args('input') input: CategoryCreateInput) {
    return await this.categoryService.createCategory(input);
  }

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Mutation(returns => CategoryType)
  async removeCategory(@Args('title') title: string) {
    return this.categoryService.removeCategory(title);
  }
  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Mutation(returns => CategoryType)
  async recoverCategory(@Args('title') title: string) {
    return this.categoryService.recoverCategory(title);
  }

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @Mutation(returns => CategoryType)
  async updateCategory(
    @Args('title') title: string,
    @Args('input') input: CategoryUpdateInput,
  ) {
    return await this.categoryService.updateCategory(title, input);
  }
}
