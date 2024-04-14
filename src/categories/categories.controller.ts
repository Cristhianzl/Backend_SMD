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
  HttpException,
  Inject,
} from '@nestjs/common';
import {
  ApiDefaultResponse,
  ApiExtraModels,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { GetCategoriesDto } from './entities/categories.entity';
import { CategoriesService } from './categories.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('categories')
@Controller('categories')
@ApiExtraModels(GetCategoriesDto)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private jwtService: JwtService,
    private authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
  async findAll(@Headers('authorization') token: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
    const data = await this.categoriesService.listAll();
    return GetCategoriesDto.factoryPaginate(
      data.data.row,
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
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  @UseGuards(AuthGuard)
  async findWithFilter(
    @Headers('authorization') token: any,
    @Body() filters: any,
    @Param('pageindex') pageindex: number,
    @Param('pagesize') pagesize: number,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);

    const userCacheCheck = await this.cacheManager.get(
      'categories-ok-' + access.username,
    );
    if (!userCacheCheck) {
      const checkUser = await this.authService.invalidateHackerToken(
        access.username,
      );
      if (checkUser === true) {
        await this.cacheManager.set(
          'categories-ok-' + access.username,
          'categories-ok-' + access.username,
        );
      } else {
        throw new HttpException('User não autorizado', HttpStatus.FORBIDDEN);
      }
    }
    const data = await this.categoriesService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetCategoriesDto.factoryPaginate(
      GetCategoriesDto,
      data.data.rows,
      Number(pageindex),
      data.data.rowCount,
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
  @UseGuards(AuthGuard)
  @Post()
  async add(@Headers('authorization') token: any, @Body() input: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  @UseGuards(AuthGuard)
  @Put()
  async edit(@Headers('authorization') token: any, @Body() input: any) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
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
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async remove(
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);
    const data = await this.categoriesService.remove(id);
    return GetCategoriesDto.factory(GetCategoriesDto, data[0]);
  }
}
