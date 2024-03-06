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
  Query,
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
import { AuthGuard } from 'src/guards/auth.guard';

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
  @UseGuards(AuthGuard)
  @Get('/subscriptionCheck')
  async subscriptionCheck(@Headers('authorization') token: any) {
    this.setTenant(token);
    const data = await this.userService.subscriptionCheck(token);
    return {
      data: data,
    };
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
  @UseGuards(AuthGuard)
  @Get('/subscribe/:key/')
  async subscribe(
    @Headers('authorization') token: any,
    @Param('key') key: string,
  ) {
    this.setTenant(token);
    const data = await this.userService.subscribe(token, atob(key));
    return {
      data: data,
    };
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
  @Get('/generate-key')
  async generateKey(@Query('user') user?: string) {
    const hashCode = await this.userService.generateKey(user);

    const response = {
      hashCode,
      email: btoa(user),
    };

    return response;
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
  @Get('/recovery-password')
  async recoveryPassword(
    @Query('hash') hash: string,
    @Query('newPassword') newPassword: string,
  ) {
    const message = await this.userService.recoveryPassword(
      hash,
      atob(newPassword),
    );

    const response = {
      message,
    };

    return response;
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
  async findAll(@Headers('authorization') token: any) {
    this.setTenant(token);
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
    @Headers('authorization') token: any,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    this.setTenant(token);
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
    @Headers('authorization') token: any,
    @Body() filters: any,
    @Param('pageindex') pageindex: number,
    @Param('pagesize') pagesize: number,
  ) {
    this.setTenant(token);
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
  async add(@Headers('authorization') token: any, @Body() input: any) {
    this.setTenant(token);
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
  @UseGuards(AuthGuard)
  async edit(@Headers('authorization') token: any, @Body() input: any) {
    this.setTenant(token);
    const data = await this.userService.edit(input, token);
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
  @Delete()
  async remove(@Headers('authorization') token: any) {
    this.setTenant(token);
    const data = await this.userService.remove(token);
    return {
      message: data,
    };
  }
}
