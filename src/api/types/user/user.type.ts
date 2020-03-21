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
}
