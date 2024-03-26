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
  UseGuards,
} from '@nestjs/common';
import {
  ApiDefaultResponse,
  ApiExtraModels,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductsService } from './products.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('products')
@Controller('products')
@ApiExtraModels(GetProductsDto)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private jwtService: JwtService,
  ) {}

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
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Headers('authorization') token: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  @UseGuards(AuthGuard)
  @Get('/:id')
  async findOne(
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  @UseGuards(AuthGuard)
  @Get('/:pageindex/:pagesize')
  async findWithFilter(
    @Headers('authorization') token: any,
    @Body() filters: any,
    @Param('pageindex') pageindex: number,
    @Param('pagesize') pagesize: number,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
    const data = await this.productsService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetProductsDto.factoryPaginate(
      GetProductsDto,
      data.data.rows,
      Number(pageindex),
      data.data.rowCount,
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
  @UseGuards(AuthGuard)
  @Post()
  async add(@Headers('authorization') token: any, @Body() input: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  @UseGuards(AuthGuard)
  @Put()
  async edit(@Headers('authorization') token: any, @Body() input: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async remove(
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
    const data = await this.productsService.remove(id);
    return GetProductsDto.factory(GetProductsDto, data[0]);
  }
}
