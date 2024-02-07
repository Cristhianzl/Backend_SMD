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
import { JwtService } from '@nestjs/jwt';

@ApiTags('stores')
@Controller('stores')
@ApiExtraModels(GetStoresDto)
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
    private jwtService: JwtService,
  ) {}

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
  async findAll(@Headers('authorization') token: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
    @Headers('authorization') token: any,
    @Body() filters: any,
    @Param('pageindex') pageindex: number,
    @Param('pagesize') pagesize: number,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  async add(@Headers('authorization') token: any, @Body() input: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  async edit(@Headers('authorization') token: any, @Body() input: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
    const data = await this.storesService.remove(id);
    return GetStoresDto.factory(GetStoresDto, data[0]);
  }
}
