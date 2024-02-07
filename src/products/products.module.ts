import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
