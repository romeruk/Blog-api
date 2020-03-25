import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

@InputType()
export class CategoryCreateInput {
  @Field(type => String)
  @IsNotEmpty()
  title: string;
}

@InputType()
export class CategoryUpdateInput extends CategoryCreateInput {}
