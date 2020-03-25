import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { AppBaseEntity } from '../base/base.entity';
import { Post } from '../post/post.entity';

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity()
export class User extends AppBaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @PrimaryColumn({
    unique: true,
  })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    default: false,
  })
  verified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({ type: 'varchar', nullable: true })
  passwordResetToken: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(
    type => Post,
    post => post.user,
    {
      nullable: true,
    },
  )
  posts: Post[] | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
