import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Entity } from 'typeorm';

@Entity('products')
export class Products {
  @ApiProperty({ example: '4b102963-050f-4cee-92a8-e43cd2fe6d52' })
  @Expose()
  id: string;

  @Expose()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => value.trim())
  name: string;

  @Expose()
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  on_sale: boolean;

  @Expose()
  @IsOptional()
  created_at?: Date;

  @Expose()
  @IsOptional()
  updated_at?: Date;

  @Expose()
  @IsNumber()
  alternative_id: number;

  @Expose()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => value.trim())
  discount_type: string;

  @Expose()
  @IsNumber()
  discount_value: number;

  @Expose()
  @IsOptional()
  @IsUUID()
  url_img?: string | null;

  @Expose()
  @IsOptional()
  @IsUUID()
  description?: string | null;
}
