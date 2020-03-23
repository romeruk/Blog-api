import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(type => String)
  firstName: string;
  @Field(type => String)
  lastName: string;
  @Field(type => String)
  email: string;
  @Field(type => Boolean)
  isAdmin: boolean;
  @Field(type => Boolean)
  verified: boolean;
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
export class Users {
  @Field(type => Int)
  total: number;
  @Field(type => [UserType])
  users: UserType[];
}
