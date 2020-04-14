import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, Equal } from 'typeorm';
import {
  CategoryCreateInput,
  CategoryUpdateInput,
} from 'src/api/inputs/category/category.input';
import { Category } from 'src/entity/category/category.entity';
import slugify from 'slugify';
import { Categories } from 'src/api/types/category/category.type';
import { Post } from 'src/entity/post/post.entity';

@Injectable()
export class CategoryService {
  constructor(@InjectConnection() private connection: Connection) {}

  async findOne(title: string) {
    const category = await this.connection.getRepository(Category).findOne({
      where: {
        title,
      },
    });

    return category;
  }

  async findOneBySlug(slug: string) {
    const category = await this.connection.getRepository(Category).findOne({
      where: {
        slug,
      },
    });

    return category;
  }

  async createCategory(input: CategoryCreateInput): Promise<Category> {
    const existing = await this.findOne(input.title);

    if (existing) {
      throw new InternalServerErrorException([
        {
          name: 'title',
          message: 'Title must be unique',
        },
      ]);
    }

    const category = new Category();
    category.title = input.title;
    category.slug = slugify(input.title);

    return await this.connection
      .getRepository(Category)
      .save(category, { reload: false });
  }

  async removeCategory(title: string) {
    const category = await this.findOne(title);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const posts = await this.connection
      .getRepository(Post)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.categories', 'categories')
      .where('categories.title = :title', { title })
      .getMany();

    if (posts && posts.length) {
      for (const post of posts) {
        post.categories = post.categories.filter(category => {
          category.title !== category.title;
        });
      }

      await this.connection.manager.save(posts, { reload: false });
    }

    await this.connection.getRepository(Category).remove(category);

    return true;
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.connection.getRepository(Category).find();
  }

  async findAll(limit = 10, page = 0): Promise<Categories> {
    const [categories, total] = await this.connection
      .getRepository(Category)
      .findAndCount({
        skip: page > 0 ? (page - 1) * limit : 0,
        take: limit,
      });

    const foundСategories = new Categories();
    foundСategories.categories = categories;
    foundСategories.total = total;

    return foundСategories;
  }
}
