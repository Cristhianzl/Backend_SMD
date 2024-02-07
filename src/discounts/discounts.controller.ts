import {
  Controller,
  Get,
  HttpStatus,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiDefaultResponse,
  ApiExtraModels,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiscountsService } from './discounts.service';
import { GetDiscountDto } from './dto/get-discounts.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('discounts')
@Controller('discounts')
@ApiExtraModels(GetDiscountDto)
export class DiscountsController {
  constructor(
    private readonly discountsService: DiscountsService,
    private jwtService: JwtService,
  ) {}

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
  @UseGuards(AuthGuard)
  async findAll(@Headers('authorization') token: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
    const discounts = await this.discountsService.listAll();
    return GetDiscountDto.factory(GetDiscountDto, discounts);
  }
}
