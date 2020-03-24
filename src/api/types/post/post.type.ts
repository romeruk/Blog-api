import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserType } from '../user/user.type';
import { CategoryType } from '../category/category.type';

@ObjectType()
export class Image {
  @Field(type => String)
  url: string;
}

@ObjectType()
export class PostType {
  @Field(type => String)
  title: string;
  @Field(type => String)
  slug: string;
  @Field(type => String)
  content: string;
  @Field(type => Boolean)
  isActive: boolean;
  @Field(type => [Image])
  images: Image[];
  @Field(type => UserType)
  user: UserType;
  @Field(type => [CategoryType])
  categories: CategoryType[];
}