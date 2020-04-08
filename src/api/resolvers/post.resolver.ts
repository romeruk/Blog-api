import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/common/guards/gql.guard';
import { UseGuards } from '@nestjs/common';
import { CreatePostInput, EditPostInput } from '../inputs/post/post.input';
import { CurrentUser, Roles } from 'src/common/decorators/decorators';
import { PostService } from 'src/service/services/post.service';
import { IPayload } from 'src/common/interfaces/payload.interface';
import { PostType, Posts, EditPostType } from '../types/post/post.type';
import { AdminGqlGuard } from 'src/common/guards/role.guard';
import { UserRole } from 'src/entity/user/user.entity';

@Resolver('Post')
export class PostResolver {
  constructor(private postService: PostService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => PostType)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: IPayload,
  ) {
    return await this.postService.createPost(input, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => Posts)
  async findMyPosts(
    @Args('limit') limit: number,
    @Args('page') page: number,
    @CurrentUser() user: IPayload,
  ) {
    return await this.postService.findMyPosts(limit, page, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => Boolean)
  async removeMyPost(
    @Args('title') title: string,
    @CurrentUser() user: IPayload,
  ) {
    return this.postService.removeMyPost(title, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(returns => EditPostType)
  async findOneBySlug(@Args('slug') slug: string) {
    return this.postService.getPostWithAllCategories(slug);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => PostType)
  async editPost(@Args('input') input: EditPostInput) {
    return await this.postService.editPost(input);
  }

  @Query(returns => Posts)
  async getAllPosts(@Args('limit') limit: number, @Args('page') page: number) {
    return this.postService.getAllPosts(limit, page);
  }

  @UseGuards(GqlAuthGuard, AdminGqlGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Mutation(returns => PostType)
  async activeOrDisActivePost(@Args('title') title: string) {
    return this.postService.activeOrDisActivePost(title);
  }
}
