import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { AppBaseEntity } from '../base/base.entity';
import { Post } from '../post/post.entity';
@Entity()
export class User extends AppBaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @PrimaryColumn()
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
    default: false,
  })
  isAdmin: boolean;

  @OneToMany(
    type => Post,
    post => post.user,
    {
      nullable: true,
    },
  )
  posts: Post[];
}
