import { Controller, Get, HttpStatus, Headers } from '@nestjs/common';
import {
  ApiDefaultResponse,
  ApiExtraModels,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { GetDiscountDto } from './dto/get-discounts.dto';

@ApiTags('discounts')
@Controller('discounts')
@ApiExtraModels(GetDiscountDto)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  setTenant(tenant: string) {
    this.discountsService.setTenant(tenant);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    description: 'List of discounts',
    type: GetDiscountDto,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Get()
  async findAll(@Headers('tenant') tenantId: string) {
    this.setTenant(tenantId);
    const discounts = await this.discountsService.listAll();
    return GetDiscountDto.factory(GetDiscountDto, discounts);
  }
}
