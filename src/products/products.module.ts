import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FileUploaderModule } from 'src/file-uploader/file-uploader.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60,
      max: 100,
    }),
    AuthModule,
    FileUploaderModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
