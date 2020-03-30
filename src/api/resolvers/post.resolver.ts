import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/common/guards/gql.guard';
import { UseGuards } from '@nestjs/common';
import { CreatePostInput } from '../inputs/post/post.input';
import { CurrentUser } from 'src/common/decorators/decorators';
import { PostService } from 'src/service/services/post.service';
import { IPayload } from 'src/common/interfaces/payload.interface';
import { PostType } from '../types/post/post.type';

@Resolver('Post')
export class PostResolver {
  constructor(private postService: PostService) {}

  @Query(returns => String)
  hello() {
    return 'hello';
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(returns => PostType)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: IPayload,
  ) {
    return await this.postService.createPost(input, user);
  }
}
