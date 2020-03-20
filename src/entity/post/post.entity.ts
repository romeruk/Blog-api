import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { AppBaseEntity } from '../base/base.entity';
import { User } from '../user/user.entity';
import { Category } from '../category/category.entity';
import { Image } from '../image/image.entity';
@Entity()
export class Post extends AppBaseEntity {
  @Column()
  @PrimaryColumn()
  title: string;
  @Column()
  @PrimaryColumn()
  slug: string;
  @Column()
  content: string;

  @Column({
    default: false,
  })
  isActive: boolean;

  @ManyToOne(
    type => User,
    user => user.posts,
  )
  user: User;

  @OneToMany(
    type => Image,
    image => image.post,
  )
  images: Image[];

  @ManyToMany(type => Category)
  @JoinTable()
  categories: Category[];
}
