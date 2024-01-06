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
  ApiTags,
} from '@nestjs/swagger';
import { GetTenantsDto } from './dto/get-tenants.dto';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@Controller('tenants')
@ApiExtraModels(GetTenantsDto)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  setTenant(tenant: string) {
    this.tenantsService.setTenant(tenant);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetTenantsDto,
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
    const data = await this.tenantsService.listAll();
    return GetTenantsDto.factoryPaginate(
      GetTenantsDto,
      data.data,
      1,
      data.count,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetTenantsDto,
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
    const data = await this.tenantsService.find(id);
    return GetTenantsDto.factory(GetTenantsDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetTenantsDto,
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
    const data = await this.tenantsService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetTenantsDto.factoryPaginate(
      GetTenantsDto,
      data.data,
      Number(pageindex),
      data.data.length,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetTenantsDto,
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
    const data = await this.tenantsService.add(input);
    return GetTenantsDto.factory(GetTenantsDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetTenantsDto,
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
    const data = await this.tenantsService.edit(input);
    return GetTenantsDto.factory(GetTenantsDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetTenantsDto,
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
    const data = await this.tenantsService.remove(id);
    return GetTenantsDto.factory(GetTenantsDto, data[0]);
  }
}
