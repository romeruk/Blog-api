import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

@InputType()
export class CategoryCreateInput {
  @Field(type => String)
  @IsNotEmpty()
  title: string;

  @Field(type => String, {
    nullable: true,
  })
  @IsOptional()
  @MinLength(2)
  slug?: string;
}

@InputType()
export class CategoryUpdateInput extends CategoryCreateInput {}
