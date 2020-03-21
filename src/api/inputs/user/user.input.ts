import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(type => String)
  @IsNotEmpty()
  firstName: string;

  @Field(type => String)
  @IsNotEmpty()
  lastName: string;

  @Field(type => String)
  @IsEmail()
  email: string;

  @Field(type => String)
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

@InputType()
export class resetPasswordInput {
  @Field(type => String)
  @IsNotEmpty()
  passwordResetToken: string;
  @Field(type => String)
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
