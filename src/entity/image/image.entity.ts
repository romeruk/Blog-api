import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AppBaseEntity } from '../base/base.entity';
import { Post } from '../post/post.entity';
@Entity()
export class Image extends AppBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(
    type => Post,
    post => post.images,
  )
  post: Post;
}
