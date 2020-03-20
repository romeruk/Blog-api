import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AppBaseEntity {
  @CreateDateColumn() createdAt: Date;

  @UpdateDateColumn() updatedAt: Date;
}
