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
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetMenuDto } from './entities/menu.entity';
import { MenusService } from './menu.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('menus')
@Controller('menus')
@ApiExtraModels(GetMenuDto)
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private jwtService: JwtService,
  ) {}

  setTenant(tenant: string) {
    this.menusService.setTenant(tenant);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Get('getActive')
  async getActive(@Headers('tenant') tenantId: string) {
    this.setTenant(tenantId);
    return await this.menusService.getActive();
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @UseGuards(AuthGuard)
  @Get('check')
  async hasActive(@Headers('authorization') token: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
    const data = await this.menusService.hasActive();
    return { hasActive: data };
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetMenuDto,
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
    const data = await this.menusService.listAll();
    return GetMenuDto.factoryPaginate(
      GetMenuDto,
      data.data,
      1,
      data.count,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetMenuDto,
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
    const data = await this.menusService.find(id);
    return GetMenuDto.factory(GetMenuDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetMenuDto,
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
    const data = await this.menusService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetMenuDto.factoryPaginate(
      GetMenuDto,
      data?.data?.rows,
      Number(pageindex),
      data?.data?.rowCount,
      data.count,
      data.hasActive,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetMenuDto,
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
    const data = await this.menusService.add(input);
    return GetMenuDto.factory(GetMenuDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetMenuDto,
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
    const data = await this.menusService.edit(input);
    return GetMenuDto.factory(GetMenuDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetMenuDto,
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
    const data = await this.menusService.remove(id);
    return GetMenuDto.factory(GetMenuDto, data[0]);
  }
}
