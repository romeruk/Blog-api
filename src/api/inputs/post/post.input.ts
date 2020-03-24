import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field(type => String)
  @IsNotEmpty()
  title: string;

  @Field(type => String)
  @IsNotEmpty()
  content: string;

  @Field(type => [String])
  @IsNotEmpty({
    each: true,
  })
  categories: string[];

  @Field(type => [String])
  @IsNotEmpty({
    each: true,
  })
  images: string[];
}
