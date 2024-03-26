import { IsNumber, IsString, Length } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/shared/base.dto';

export class GetStoresDto extends BaseDto {
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
}
