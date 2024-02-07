import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiHeader } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @ApiHeader({
    name: '',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Post('checkToken')
  checkJwt(@Body() token: any) {
    return this.authService.checkJwt(token);
  }

  @ApiHeader({
    name: 'tenant',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Post('renewAccessToken')
  renewAccessToken(@Body() token: any) {
    return this.authService.renewAccessToken(token);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @ApiHeader({
    name: '',
    example: 'tenant-test',
    description: 'Tenant',
    required: true,
  })
  @Post('getUser')
  getUser(@Body() body: any) {
    return this.authService.getUser(body);
  }
}
