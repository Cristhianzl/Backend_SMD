import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Entity } from 'typeorm';

@Entity('feedback')
export class Feedback {
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
  created_at?: Date;

  @Expose()
  @IsNumber()
  alternative_id: number;

  @Expose()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => value.trim())
  email: string;

  @Expose()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => value.trim())
  phone: string;

  @Expose()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }) => value.trim())
  menuName: string;
}
