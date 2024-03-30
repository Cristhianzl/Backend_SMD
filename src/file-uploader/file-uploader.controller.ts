// file: aws-s3 > src > app.controller.ts
import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  Headers,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploaderService } from './file-uploader.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class FileUploaderController {
  constructor(
    private readonly fileUploader: FileUploaderService,
    private jwtService: JwtService,
  ) {}

  setTenant(tenant: string) {
    this.fileUploader.setTenant(tenant);
  }

  @UseGuards(AuthGuard)
  @Post('upload/:id/:type')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Param('type') type: string,
    @Headers('authorization') token: any,
  ) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    this.setTenant(access.tenantName);

    const uploadedData = await this.fileUploader.uploadFile(file, id, type);
    return { url: uploadedData.Location };
  }
}
