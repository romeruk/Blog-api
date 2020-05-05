import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../../category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmTestAsyncOptions } from 'src/config/typeOrmAsync.options';
import { databaseTestConfig } from 'src/config/databse.config';
import { ApplicationConfig } from 'src/config/app.config';
import { ConfigModule } from '@nestjs/config';
import slugify from 'slugify';

describe('Category Service', () => {
  let categoryService: CategoryService;

  const defaultCategory = {
    title: 'Test category',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseTestConfig, ApplicationConfig],
          envFilePath: ['.env.development'],
        }),
        TypeOrmModule.forRootAsync(typeOrmTestAsyncOptions),
      ],
      providers: [CategoryService],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
  });

  describe('Category service test methods', () => {
    it('should create category', async () => {
      const slug = slugify(defaultCategory.title);

      const category = await categoryService.createCategory(defaultCategory);

      expect(category).toBeDefined();
      expect(category.title).toEqual(defaultCategory.title);
      expect(category.slug).toEqual(slug);
    });

    it('should remove category', async () => {
      const isRemoved = await categoryService.removeCategory(
        defaultCategory.title,
      );
      const category = await categoryService.findOne(defaultCategory.title);

      expect(isRemoved).toBe(true);
      expect(category).toBeUndefined();
    });

    it('should return array of categories', async () => {
      const categoriesArr = [
        'Category 1',
        'Category 2',
        'Category 3',
        'Category 4',
        'Category 5',
        'Category 6',
        'Category 7',
        'Category 8',
        'Category 9',
        'Category 10',
      ];
      for (const category of categoriesArr) {
        await categoryService.createCategory({
          title: category,
        });
      }

      const foundCategories = await categoryService.getAllCategories();
      expect(foundCategories).toBeDefined();
      expect(foundCategories.length).toBe(10);
    });
  });
});
