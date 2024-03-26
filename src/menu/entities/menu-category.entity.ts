import { IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/shared/base.dto';

export class GetMenuCategoryDto extends BaseDto {
  @ApiProperty({ example: '4b102963-050f-4cee-92a8-e43cd2fe6d52' })
  @Expose()
  id: string;

  @Expose()
  @IsNumber()
  alternative_id: number;

  @Expose()
  @IsNumber()
  menu_id: string;

  @Expose()
  @IsNumber()
  category_id: string;
}
