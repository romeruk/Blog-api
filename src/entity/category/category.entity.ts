import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../base/base.entity';
@Entity()
export class Category extends AppBaseEntity {
  @Column()
  @PrimaryColumn({
    unique: true,
  })
  title: string;
  @Column()
  @PrimaryColumn({
    unique: true,
  })
  slug: string;
}
