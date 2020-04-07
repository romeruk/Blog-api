import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

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
}

@InputType()
export class EditPostInput extends CreatePostInput {}
