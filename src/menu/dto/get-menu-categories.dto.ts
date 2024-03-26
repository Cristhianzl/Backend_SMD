import { BaseDto } from 'src/shared/base.dto';
import { PrimaryGeneratedColumn, Column } from 'typeorm';

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
