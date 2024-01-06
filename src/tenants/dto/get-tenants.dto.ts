import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/shared/base.dto';

export class GetTenantsDto extends BaseDto {
  @ApiProperty()
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

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  tenant_img: string;
}
