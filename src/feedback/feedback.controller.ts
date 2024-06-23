import {
  Controller,
  Get,
  HttpStatus,
  Headers,
  ParseUUIDPipe,
  Param,
  Body,
  Post,
  UseGuards,
  Inject,
  HttpException,
} from '@nestjs/common';
import {
  ApiDefaultResponse,
  ApiExtraModels,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { GetFeedbackDto } from './dto/get-feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('feedbacks')
@Controller('feedbacks')
@ApiExtraModels(GetFeedbackDto)
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private jwtService: JwtService,
  ) {}

  setTenant(tenant: string) {
    this.feedbackService.setTenant(tenant);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetFeedbackDto,
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
    const data = await this.feedbackService.listAll();
    return GetFeedbackDto.factoryPaginate(
      GetFeedbackDto,
      data.data,
      1,
      data.count,
      data.count,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetFeedbackDto,
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
    const data = await this.feedbackService.find(id);
    return GetFeedbackDto.factory(GetFeedbackDto, data);
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetFeedbackDto,
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

    const data = await this.feedbackService.findWithFilter(
      filters,
      pageindex,
      pagesize,
    );
    return GetFeedbackDto.factoryPaginate(
      GetFeedbackDto,
      data.data.rows,
      Number(pageindex),
      data.data.rowCount,
      data.count,
      false,
      data.dataRecommendations,
    );
  }

  @ApiDefaultResponse({
    status: HttpStatus.OK,
    type: GetFeedbackDto,
  })
  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Post()
  async add(@Body() input: any, @Headers('tenant') tenant: string) {
    const feedbackData = input.newFeedback;
    if (!feedbackData.tenant) {
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }

    if (!tenant) {
      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    }

    const decodeDate = atob(tenant);
    const dateRequest = new Date(decodeDate);
    const dateNow = new Date();
    const diffTime = Math.abs(dateNow.getTime() - dateRequest.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes > 1) {
      throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
    }

    this.setTenant(feedbackData.tenant);
    const data = await this.feedbackService.add(feedbackData);
    return GetFeedbackDto.factory(GetFeedbackDto, data);
  }
}
