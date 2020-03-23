import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import {
  CategoryCreateInput,
  CategoryUpdateInput,
} from 'src/api/inputs/category/category.input';
import { Category } from 'src/entity/category/category.entity';
import slugify from 'slugify';
import { Categories } from 'src/api/types/category/category.type';

@Injectable()
export class CategoryService {
  constructor(@InjectConnection() private connection: Connection) {}

  async findOne(title: string) {
    const category = await this.connection.getRepository(Category).findOne({
      where: {
        title: title,
      },
    });

    return category;
  }

  async createCategory(input: CategoryCreateInput): Promise<Category> {
    const existing = this.findOne(input.title);

    if (existing) {
      throw new InternalServerErrorException('Title must be unique');
    }

    const category = new Category();
    category.title = input.title;
    category.slug = slugify(input.title);

    return await this.connection
      .getRepository(Category)
      .save(category, { reload: false });
  }

  async removeCategory(title: string): Promise<Category> {
    const category = await this.findOne(title);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const removedCategory = await this.connection
      .getRepository(Category)
      .softRemove(category);

    return removedCategory;
  }

  async recoverCategory(title: string): Promise<Category> {
    const category = await this.findOne(title);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const restoredCategory = await this.connection
      .getRepository(Category)
      .recover(category);

    return restoredCategory;
  }

  async updateCategory(title: string, input: CategoryUpdateInput) {
    const existing = await this.findOne(input.title);

    if (existing) {
      throw new InternalServerErrorException('Title must be unique');
    }

    const findCategory = await this.findOne(title);

    if (!findCategory) {
      throw new NotFoundException('Category not found');
    }

    await this.connection
      .getRepository(Category)
      .createQueryBuilder()
      .update(Category)
      .set({ title: input.title, slug: slugify(input.title) })
      .where('title = :title', { title })
      .execute();

    const updatedCategory = await this.findOne(title);

    return updatedCategory;
  }

  async findAll(limit = 10, page = 0): Promise<Categories> {
    const [categories, total] = await this.connection
      .getRepository(Category)
      .findAndCount({
        skip: page > 0 ? (page - 1) * limit : 0,
        take: limit,
        withDeleted: true,
      });

    const foundСategories = new Categories();
    foundСategories.categories = categories;
    foundСategories.total = total;

    return foundСategories;
  }
}