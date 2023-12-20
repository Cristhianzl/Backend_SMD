import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tenant')
export class Tenant {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tenant_name: string;

  @ApiProperty()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty()
  @IsOptional()
  deletedAt?: Date;

  @ApiProperty()
  @IsOptional()
  updatedAt?: Date;

  @ApiProperty()
  @IsInt()
  alternativeId: number;
}
