import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { CurrentUser } from 'src/common/decorators/decorators';
import { IPayload } from 'src/common/interfaces/payload.interface';
import { Post } from 'src/entity/post/post.entity';
import slugify from 'slugify';
import { UserService } from './user.service';
import { CategoryService } from './category.service';
import { CreatePostInput } from 'src/api/inputs/post/post.input';
import { Image as ImageEntity } from 'src/entity/image/image.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectConnection() private connection: Connection,
    private userService: UserService,
    private categoryService: CategoryService,
  ) {}

  async createPost(input: CreatePostInput, @CurrentUser() user: IPayload) {
    const existing = await this.findOne(input.title);
    if (existing) {
      throw new InternalServerErrorException('Title must be unique');
    }

    const author = await this.userService.getUserByEmailAddress(user.email);

    const post = new Post();
    post.title = input.title;
    post.slug = slugify(input.title);
    post.content = input.content;

    if (user.isAdmin) {
      post.isActive = true;
    }

    post.user = author;

    let savedPost = await this.connection.manager.save(post);

    await this.assignImages(savedPost.title, input.images);

    for (const category of input.categories) {
      savedPost = await this.assignCategory(savedPost.title, category);
    }

    return savedPost;
  }

  async assignImages(postTitle: string, images: string[]) {
    const post = await this.findOne(postTitle);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    for (const image of images) {
      const newImg = new ImageEntity();
      newImg.post = post;
      newImg.url = image;
      await this.connection.manager.save(newImg);
    }
  }

  async assignCategory(
    postTitle: string,
    categoryTitle: string,
  ): Promise<Post> {
    const post = await this.findOne(postTitle);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const category = await this.categoryService.findOne(categoryTitle);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    post.categories.push(category);

    await this.connection.manager.save(post, { reload: false });
    return post;
  }

  async findOne(title: string) {
    const post = await this.connection.getRepository(Post).findOne({
      where: {
        title: title,
      },
      relations: ['categories', 'images', 'user'],
    });

    return post;
  }
}
