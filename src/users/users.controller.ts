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
import { GetUsersDto } from './entities/users.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@ApiExtraModels(GetUsersDto)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  setTenant(tenant: string) {
    this.userService.setTenant(tenant);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetUsersDto,
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
    const data = await this.userService.listAll();
    return GetUsersDto.factoryPaginate(
      GetUsersDto,
      data.data,
      1,
      data.count,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetUsersDto,
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
    const data = await this.userService.find(id);
    return GetUsersDto.factory(GetUsersDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetUsersDto,
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
    const data = await this.userService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetUsersDto.factoryPaginate(
      GetUsersDto,
      data.data,
      Number(pageindex),
      data.data.length,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetUsersDto,
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
    const data = await this.userService.add(input);
    return GetUsersDto.factory(GetUsersDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetUsersDto,
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
    const data = await this.userService.edit(input);
    return GetUsersDto.factory(GetUsersDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetUsersDto,
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
    const data = await this.userService.remove(id);
    return GetUsersDto.factory(GetUsersDto, data[0]);
  }
}
