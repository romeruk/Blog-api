import { ObjectType, Field } from '@nestjs/graphql';

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
