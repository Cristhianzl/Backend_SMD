import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/shared/base.dto';

export class GetMenuDto extends BaseDto {
  @ApiProperty({ example: '4b102963-050f-4cee-92a8-e43cd2fe6d52' })
  @Expose()
  id: string;

  @Expose()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => value.trim())
  name: string;

  @Expose()
  @IsNumber()
  alternative_id: number;

  @Expose()
  @IsOptional()
  created_at?: Date;

  @Expose()
  @IsOptional()
  updated_at?: Date;

  @Expose()
  @IsOptional()
  categories?: string[];
}
