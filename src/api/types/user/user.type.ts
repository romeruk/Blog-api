import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { UserRole } from 'src/entity/user/user.entity';

registerEnumType(UserRole, {
  name: 'UserRole', // this one is mandatory
  description: 'The basic directions', // this one is optional
});

@ObjectType()
export class UserType {
  @Field(type => String)
  firstName: string;
  @Field(type => String)
  lastName: string;
  @Field(type => String)
  email: string;
  @Field(type => UserRole)
  role: UserRole;
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
