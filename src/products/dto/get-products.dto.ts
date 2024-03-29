import { BaseDto } from 'src/shared/base.dto';
import { Categories } from 'src/categories/dto/get-categories.dto';
import { Category } from 'src/entities/category.entity';

import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export class GetProductsDto extends BaseDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ManyToOne(() => Category, (category) => category.id)
  @JoinColumn([{ name: 'category_id', referencedColumnName: 'id' }])
  category_id: Categories;

  @Column({ type: 'numeric', nullable: false })
  price: number;

  @Column({ type: 'boolean', nullable: false })
  on_sale: boolean;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({
    type: 'int',
  })
  alternative_id: number;

  @BeforeInsert()
  generateUuid() {
    if (!this.id) {
      this.id = uuid();
    }
  }

  @Column({ type: 'string' })
  discount_type: string;

  @Column({ type: 'numeric' })
  discount_value: number;

  @Column({ type: 'varchar', nullable: true })
  url_img?: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;
}
