import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';

@Module({
  imports: [],
  providers: [StoresService],
  controllers: [StoresController],
})
export class StoresModule {}
