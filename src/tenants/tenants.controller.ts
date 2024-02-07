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
import { GetTenantsDto } from './dto/get-tenants.dto';
import { TenantsService } from './tenants.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('tenants')
@Controller('tenants')
@ApiExtraModels(GetTenantsDto)
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private jwtService: JwtService,
  ) {}

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
  async findAll(@Headers('authorization') token: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  @UseGuards(AuthGuard)
  @Get('/findByName')
  async findByName(@Headers('authorization') token: any) {
    const data = await this.tenantsService.findByName(token);
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
  @Get('/:id')
  async findOne(
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.setTenant(token);
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
    @Headers('authorization') token: any,
    @Body() filters: any,
    @Param('pageindex') pageindex: number,
    @Param('pagesize') pagesize: number,
  ) {
    this.setTenant(token);
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
  async add(@Headers('authorization') token: any, @Body() input: any) {
    this.setTenant(token);
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
  async edit(@Headers('authorization') token: any, @Body() input: any) {
    this.setTenant(token);
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
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.setTenant(token);
    const data = await this.tenantsService.remove(id);
    return GetTenantsDto.factory(GetTenantsDto, data[0]);
  }
}
