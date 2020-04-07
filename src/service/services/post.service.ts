import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { CurrentUser } from 'src/common/decorators/decorators';
import { IPayload } from 'src/common/interfaces/payload.interface';
import { Post } from 'src/entity/post/post.entity';
import slugify from 'slugify';
import { UserService } from './user.service';
import { CategoryService } from './category.service';
import { CreatePostInput, EditPostInput } from 'src/api/inputs/post/post.input';
import { Image as ImageEntity } from 'src/entity/image/image.entity';
import { UserRole } from 'src/entity/user/user.entity';
import { Category } from 'src/entity/category/category.entity';
import { Posts, EditPostType } from 'src/api/types/post/post.type';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

const regexImages = /(data:image\/[^;]+;base64[^"]+)/g;

const regexImagesLink = /(https?:)?\/\/?[^'"<>]+?\.(jpg|jpeg|gif|png)/g;

@Injectable()
export class PostService {
  constructor(
    @InjectConnection() private connection: Connection,
    private userService: UserService,
    private categoryService: CategoryService,
    private cloudinary: CloudinaryService,
  ) {}

  async createPost(input: CreatePostInput, @CurrentUser() user: IPayload) {
    const { title, categories, ...rest } = input;
    let { content } = rest;

    const existing = await this.findOne(title);
    if (existing) {
      throw new InternalServerErrorException([
        {
          name: 'title',
          message: 'Title must be unique',
        },
      ]);
    }

    const base64Images = content.match(regexImages);
    const linkImages = content.match(regexImagesLink);

    let contentImages = [];

    if (base64Images) {
      contentImages = [...contentImages, ...base64Images];
    }

    if (linkImages) {
      contentImages = [...contentImages, ...linkImages];
    }

    if (contentImages.length < 1) {
      throw new BadRequestException([
        {
          name: 'content',
          message: 'Need to upload at least 1 image',
        },
      ]);
    }

    const uploadedImages = [];

    const imagesPromises = this.cloudinary.uploadImages(contentImages);

    for (const promise of imagesPromises) {
      const res = await promise;
      uploadedImages.push(res);
    }

    for (let i = 0; i < uploadedImages.length; i++) {
      content = content.replace(contentImages[i], uploadedImages[i]);
    }

    const author = await this.userService.getUserByEmailAddress(user.email);

    const post = new Post();
    post.title = title;
    post.slug = slugify(title);
    post.content = content;

    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN) {
      post.isActive = true;
    } else {
      post.isActive = false;
    }

    post.user = author;

    post.categories = await this.assignCategories(categories);
    post.images = await this.assignImages(uploadedImages);

    return await this.connection.manager.save(post, { reload: false });
  }

  async findMyPosts(
    limit = 10,
    page = 0,
    @CurrentUser() user: IPayload,
  ): Promise<Posts> {
    const [posts, total] = await this.connection
      .getRepository(Post)
      .findAndCount({
        where: {
          user: user.email,
        },
        skip: page > 0 ? (page - 1) * limit : 0,
        take: limit,
      });

    const foundPosts = new Posts();
    foundPosts.posts = posts;
    foundPosts.total = total;

    return foundPosts;
  }

  async removeMyPost(title: string, @CurrentUser() user: IPayload) {
    const post = await this.findOne(title);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.email !== user.email) {
      throw new BadRequestException('You cannot remove this post');
    }

    const clodinaryImages = this.cloudinary.removeCloudinaryImages(post);
    await Promise.all(clodinaryImages);

    await this.connection.getRepository(ImageEntity).remove(post.images);
    await this.connection.getRepository(Post).remove(post);

    return true;
  }

  async editPost(input: EditPostInput) {
    const post = await this.findOne(input.title);
    if (!post) {
      throw new NotFoundException([
        {
          name: 'title',
          message: 'Post not found',
        },
      ]);
    }

    let { content } = input;

    const base64Images = content.match(regexImages);
    const linkImages = content.match(regexImagesLink);

    let contentImages = [];

    if (base64Images) {
      contentImages = [...contentImages, ...base64Images];
    }

    if (linkImages) {
      contentImages = [...contentImages, ...linkImages];
    }

    if (contentImages.length < 1) {
      throw new BadRequestException([
        {
          name: 'content',
          message: 'Need to upload at least 1 image',
        },
      ]);
    }

    const uploadedImages: string[] = [];

    const imagePromises = this.cloudinary.uploadImages(contentImages);

    for (const promise of imagePromises) {
      const res = await promise;
      uploadedImages.push(res);
    }

    for (let i = 0; i < uploadedImages.length; i++) {
      content = content.replace(contentImages[i], uploadedImages[i]);
    }

    post.content = content;
    const clodinaryImages = this.cloudinary.removeCloudinaryImages(post);
    await Promise.all(clodinaryImages);

    await this.connection.getRepository(ImageEntity).remove(post.images);

    post.categories = await this.assignCategories(input.categories);
    post.images = await this.assignImages(uploadedImages);

    return await this.connection.manager.save(post, { reload: false });
  }

  async getPostWithAllCategories(slug: string): Promise<EditPostType> {
    let postWithAllCategories = new EditPostType();
    const post = await this.findOneBySlug(slug);
    postWithAllCategories = post;
    const categories = await this.categoryService.getAllWithoutDeleted();
    postWithAllCategories.allCategories = categories;

    return postWithAllCategories;
  }

  async findOneBySlug(slug: string) {
    const post = await this.connection.getRepository(Post).findOne({
      where: {
        slug,
      },
      relations: ['categories', 'images'],
    });

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

  async assignImages(uploadedImages: string[]): Promise<ImageEntity[]> {
    const postImages: ImageEntity[] = [];
    for (const image of uploadedImages) {
      const newImage = new ImageEntity();
      newImage.url = image;
      const img = await this.connection
        .getRepository(ImageEntity)
        .save(newImage);
      postImages.push(img);
    }

    return postImages;
  }

  async assignCategories(categories: string[]) {
    const postCategories: Category[] = [];
    for (const category of categories) {
      const findCategory = await this.categoryService.findOne(category);

      if (!findCategory) {
        throw new NotFoundException([
          {
            name: 'categories',
            message: `Category ${category} not found`,
          },
        ]);
      }

      postCategories.push(findCategory);
    }

    return postCategories;
  }
}
