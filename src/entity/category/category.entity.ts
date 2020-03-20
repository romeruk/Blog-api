import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../base/base.entity';
@Entity()
export class Category extends AppBaseEntity {
  @Column()
  @PrimaryColumn()
  title: string;
  @Column()
  @PrimaryColumn()
  slug: string;
}
