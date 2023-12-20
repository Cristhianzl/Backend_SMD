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
import { StoresService } from './stores.service';
import { GetStoresDto } from './entities/stores.entity';

@ApiTags('stores')
@Controller('stores')
@ApiExtraModels(GetStoresDto)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  setTenant(tenant: string) {
    this.storesService.setTenant(tenant);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetStoresDto,
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
    const data = await this.storesService.listAll();
    return GetStoresDto.factoryPaginate(
      GetStoresDto,
      data.data,
      1,
      data.count,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetStoresDto,
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
    const data = await this.storesService.find(id);
    return GetStoresDto.factory(GetStoresDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetStoresDto,
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
    const data = await this.storesService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetStoresDto.factoryPaginate(
      GetStoresDto,
      data.data,
      Number(pageindex),
      data.data.length,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetStoresDto,
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
    const data = await this.storesService.add(input);
    return GetStoresDto.factory(GetStoresDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetStoresDto,
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
    const data = await this.storesService.edit(input);
    return GetStoresDto.factory(GetStoresDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetStoresDto,
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
    const data = await this.storesService.remove(id);
    return GetStoresDto.factory(GetStoresDto, data[0]);
  }
}
