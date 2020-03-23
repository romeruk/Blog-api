import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class CategoryType {
  @Field(type => String)
  title: string;
  @Field(type => String)
  slug: string;
  @Field(type => Date)
  createdAt: Date;
  @Field(type => Date)
  updatedAt: Date;
  @Field(type => Date, {
    nullable: true,
  })
  deletedAt?: Date;
}

@ObjectType()
export class Categories {
  @Field(type => Int)
  total: number;
  @Field(type => [CategoryType])
  categories: CategoryType[];
}
