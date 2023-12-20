import { Module } from '@nestjs/common';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';
import { Discount } from 'src/entities/discount.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Discount])],
  providers: [DiscountsService],
  controllers: [DiscountsController],
  exports: [DiscountsService],
})
export class DiscountsModule {}
