import {
  Controller,
  Get,
  HttpStatus,
  Headers,
  ParseUUIDPipe,
  Param,
  Body,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiDefaultResponse,
  ApiExtraModels,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
@ApiExtraModels(GetProductsDto)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  setTenant(tenant: string) {
    this.productsService.setTenant(tenant);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetProductsDto,
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
    const data = await this.productsService.listAll();
    return GetProductsDto.factoryPaginate(
      GetProductsDto,
      data.data,
      1,
      data.count,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetProductsDto,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Get('/:id')
  async findOne(
    @Headers('tenant') tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.setTenant(tenantId);
    const data = await this.productsService.find(id);
    return GetProductsDto.factory(GetProductsDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetProductsDto,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Get('/:pageindex/:pagesize')
  async findWithFilter(
    @Headers('tenant') tenantId: string,
    @Body() filters: any,
    @Param('pageindex') pageindex: number,
    @Param('pagesize') pagesize: number,
  ) {
    this.setTenant(tenantId);
    const data = await this.productsService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetProductsDto.factoryPaginate(
      GetProductsDto,
      data.data,
      Number(pageindex),
      data.data.length,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetProductsDto,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Post()
  async add(@Headers('tenant') tenantId: string, @Body() input: any) {
    this.setTenant(tenantId);
    const data = await this.productsService.add(input);
    return GetProductsDto.factory(GetProductsDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetProductsDto,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Put()
  async edit(@Headers('tenant') tenantId: string, @Body() input: any) {
    this.setTenant(tenantId);
    const data = await this.productsService.edit(input);
    return GetProductsDto.factory(GetProductsDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetProductsDto,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Delete('/:id')
  async remove(
    @Headers('tenant') tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.setTenant(tenantId);
    const data = await this.productsService.remove(id);
    return GetProductsDto.factory(GetProductsDto, data[0]);
  }
}
