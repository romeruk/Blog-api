import { TestingModule, Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { databaseTestConfig } from 'src/config/databse.config';
import { ApplicationConfig } from 'src/config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmTestAsyncOptions } from 'src/config/typeOrmAsync.options';
import { CategoryService } from '../../category.service';
import { UserService } from '../../user.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerAsyncOptions } from 'src/config/mailerAsync.options';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  Cloudinary,
  cloudinaryProvider,
} from 'src/cloudinary/cloudinary.provider';
import { VerificationTokenGenerator } from 'src/service/helpers/verification-token-generator';
import { PostService } from '../../post.service';
import { UserRole } from 'src/entity/user/user.entity';
import { IPayload } from 'src/common/interfaces/payload.interface';
import slugify from 'slugify';

describe('Post Service', () => {
  let categoryService: CategoryService;
  let userService: UserService;
  let postService: PostService;

  const defaultUser = {
    firstName: 'FirstName',
    lastName: 'LastName',
    email: 'test@gmail.com',
    password: '123456',
  };

  const defaultCategory = {
    title: 'javascript(node.js)',
  };

  const defaultPost = {
    title: 'Test Post',
    content:
      "There are many variations of passages of Lorem Ipsum available, https://naurok-test.nyc3.digitaloceanspaces.com/162274/images/663782_1585738224.png but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, https://lizasenglish.ru/wp-content/uploads/2016/09/Tests.png injected humour, or non-characteristic words etc.",
    categories: [defaultCategory.title],
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
        MailerModule.forRootAsync(mailerAsyncOptions),
      ],

      providers: [
        VerificationTokenGenerator,
        cloudinaryProvider,
        CategoryService,
        UserService,
        PostService,
        CloudinaryService,
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    userService = module.get<UserService>(UserService);
    postService = module.get<PostService>(PostService);
  });

  it('Should create post', async () => {
    const payload: IPayload = {
      firstName: defaultUser.firstName,
      lastName: defaultUser.lastName,
      email: defaultUser.email,
      role: UserRole.USER,
    };

    const slug = slugify(defaultPost.title);

    await userService.createUser(defaultUser);
    await categoryService.createCategory(defaultCategory);
    const post = await postService.createPost(defaultPost, payload);

    expect(post.title).toBe(defaultPost.title);
    expect(post.slug).toBe(slug);
    expect(post.content).toEqual(expect.any(String));
    expect(post.isActive).toBe(false);
    expect(post.images).toEqual(expect.arrayContaining([expect.any(Object)]));
  });

  it('Should return user posts', async () => {
    const payload: IPayload = {
      firstName: defaultUser.firstName,
      lastName: defaultUser.lastName,
      email: defaultUser.email,
      role: UserRole.USER,
    };

    const userPosts = await postService.findMyPosts(10, 0, payload);

    expect(userPosts.posts).toBeDefined();
    expect(userPosts.total).toBe(1);
  });

  it('Should edit post', async () => {
    const categoriesArr = ['Category 1', 'Category 2'];

    for (const category of categoriesArr) {
      await categoryService.createCategory({
        title: category,
      });
    }

    const postContent = {
      title: defaultPost.title,
      content:
        'Some random content https://naurok-test.nyc3.digitaloceanspaces.com/162274/images/663782_1585738224.png',
      categories: categoriesArr,
    };

    const post = await postService.editPost(postContent);

    for (const category of post.categories) {
      expect(categoriesArr).toEqual(expect.arrayContaining([category.title]));
    }
    expect(post.content).toEqual(
      expect.stringContaining('Some random content'),
    );
    expect(post).toBeDefined();
  });

  it('Should active or disactive post', async () => {
    const findPost = await postService.findOne(defaultPost.title);
    const post = await postService.activeOrDisActivePost(defaultPost.title);

    expect(findPost.isActive).toBe(!post.isActive);
  });

  it('Should remove post', async () => {
    const payload: IPayload = {
      firstName: defaultUser.firstName,
      lastName: defaultUser.lastName,
      email: defaultUser.email,
      role: UserRole.USER,
    };

    await postService.removeMyPost(defaultPost.title, payload);
    const post = await postService.findOne(defaultPost.title);

    expect(post).toBeUndefined();
  });
});
