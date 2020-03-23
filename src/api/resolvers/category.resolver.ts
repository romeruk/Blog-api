import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/common/guards/gql.guard';
import { AdminGqlGuard } from 'src/common/guards/role.guard';
import { CategoryService } from 'src/service/services/category.service';
import { CategoryType } from '../types/category/category.type';
import {
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../inputs/category/category.input';
import { isAdminAccess } from 'src/common/decorators/decorators';

@Resolver('Category')
@UseGuards(GqlAuthGuard, AdminGqlGuard)
@isAdminAccess(true)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) {}

  @Query(returns => [CategoryType])
  async findAllCategories() {
    return this.categoryService.findAll();
  }

  @Query(returns => CategoryType)
  async findOneCategory(@Args('title') title: string) {
    return this.categoryService.findOne(title);
  }

  @Mutation(returns => CategoryType)
  async createCategory(@Args('input') input: CategoryCreateInput) {
    return await this.categoryService.createCategory(input);
  }

  @Mutation(returns => CategoryType)
  async removeCategory(@Args('title') title: string) {
    return this.categoryService.removeCategory(title);
  }

  @Mutation(returns => CategoryType)
  async recoverCategory(@Args('title') title: string) {
    return this.categoryService.recoverCategory(title);
  }

  @Mutation(returns => CategoryType)
  async updateCategory(
    @Args('title') title: string,
    @Args('input') input: CategoryUpdateInput,
  ) {
    return await this.categoryService.updateCategory(title, input);
  }
}
