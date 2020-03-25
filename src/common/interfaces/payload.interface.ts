import { UserRole } from 'src/entity/user/user.entity';

export interface IPayload {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: UserRole;
}
