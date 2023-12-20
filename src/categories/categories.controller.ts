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
import { GetCategoriesDto } from './entities/categories.entity';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
@ApiExtraModels(GetCategoriesDto)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  setTenant(tenant: string) {
    this.categoriesService.setTenant(tenant);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetCategoriesDto,
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
    const data = await this.categoriesService.listAll();
    return GetCategoriesDto.factoryPaginate(
      GetCategoriesDto,
      data.data,
      1,
      data.count,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetCategoriesDto,
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
    const data = await this.categoriesService.find(id);
    return GetCategoriesDto.factory(GetCategoriesDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetCategoriesDto,
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
    const data = await this.categoriesService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetCategoriesDto.factoryPaginate(
      GetCategoriesDto,
      data.data,
      Number(pageindex),
      data.data.length,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetCategoriesDto,
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
    const data = await this.categoriesService.add(input);
    return GetCategoriesDto.factory(GetCategoriesDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetCategoriesDto,
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
    const data = await this.categoriesService.edit(input);
    return GetCategoriesDto.factory(GetCategoriesDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetCategoriesDto,
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
    const data = await this.categoriesService.remove(id);
    return GetCategoriesDto.factory(GetCategoriesDto, data[0]);
  }
}
