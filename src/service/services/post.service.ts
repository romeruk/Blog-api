import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Inject,
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
import { UserRole } from 'src/entity/user/user.entity';
import { Cloudinary } from 'src/cloudinary/cloudinary.provider';
import { Category } from 'src/entity/category/category.entity';

const regexImages = /(data:image\/[^;]+;base64[^"]+)/g;

@Injectable()
export class PostService {
  constructor(
    @InjectConnection() private connection: Connection,
    private userService: UserService,
    private categoryService: CategoryService,
    @Inject(Cloudinary) private cloudinary,
  ) {}

  async createPost(input: CreatePostInput, @CurrentUser() user: IPayload) {
    const { title, categories, ...rest } = input;
    let { content } = rest;

    const existing = await this.findOne(title);
    if (existing) {
      throw new InternalServerErrorException('Title must be unique');
    }

    const contentImages = content.match(regexImages);

    if (!contentImages) {
      throw new BadRequestException([
        {
          name: 'content',
          message: 'Need to upload at least 1 image',
        },
      ]);
    }

    const uploadedImages = [];

    const Promises: any[] = contentImages.map(
      file =>
        new Promise((resolve, reject) => {
          this.cloudinary.uploader.upload(file, function(error, result) {
            if (error) {
              reject(
                new BadRequestException([
                  {
                    name: 'content',
                    message: 'Error uploading images',
                  },
                ]),
              );
            } else {
              resolve(result.url);
            }
          });
        }),
    );

    for (const promise of Promises) {
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

    const postImages: ImageEntity[] = [];
    const postCategories: Category[] = [];

    for (const image of uploadedImages) {
      const newImage = new ImageEntity();
      newImage.url = image;
      const img = await this.connection
        .getRepository(ImageEntity)
        .save(newImage);
      postImages.push(img);
    }

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

    post.categories = postCategories;
    post.images = postImages;

    return await this.connection.manager.save(post, { reload: false });
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
