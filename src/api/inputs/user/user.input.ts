import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

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
export class ResetPasswordInput {
  @Field(type => String)
  @IsNotEmpty()
  passwordResetToken: string;
  @Field(type => String)
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

@InputType()
export class UserLogInInput {
  @Field(type => String)
  @IsEmail()
  email: string;
  @Field(type => String)
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

@InputType()
export class UpdateUserInput {
  @Field(type => String)
  @IsNotEmpty()
  firstName: string;

  @Field(type => String)
  @IsNotEmpty()
  lastName: string;

  @Field(type => String, {
    nullable: true,
  })
  @IsOptional()
  @MinLength(6)
  password?: string;
}
