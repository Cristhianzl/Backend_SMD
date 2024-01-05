import { BaseDto } from 'src/shared/base.dto';
import { Categories } from 'src/categories/dto/get-categories.dto';
import { Category } from 'src/entities/category.entity';
import { Discount } from 'src/entities/discount.entity';
import { Store } from 'src/entities/store.entity';
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

export class GetMenuCategoriesDto extends BaseDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'int',
  })
  alternative_id: number;

  @Column({
    type: 'uuid',
  })
  menu_id: string;

  @Column({
    type: 'uuid',
  })
  category_id: string;
}
