import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/shared/base.dto';
import { JoinColumn, OneToOne } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Tenants } from 'src/tenants/entities/tenants.entity';
import { Tenant } from 'src/entities/tenant.entity';

export class GetUsersDto extends BaseDto {
  @ApiProperty({ example: '4b102963-050f-4cee-92a8-e43cd2fe6d52' })
  @Expose()
  id: string;

  @IsNotEmpty()
  @Expose()
  username: string;

  @IsNotEmpty()
  @Expose()
  name: string;

  @IsNotEmpty()
  @Expose()
  email: string;

  @IsNotEmpty()
  @Expose()
  password: string;

  @IsNotEmpty()
  @Expose()
  @IsBoolean()
  is_admin: boolean;

  @IsOptional()
  @Expose()
  created_at?: Date;

  @IsOptional()
  @Expose()
  updated_at?: Date;

  @Expose()
  @IsNotEmpty()
  @IsUUID()
  tenant_id: Tenants;

  @Expose()
  @IsOptional()
  @IsNumber()
  alternative_id?: number;
}
