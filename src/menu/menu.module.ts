import { Module } from '@nestjs/common';
import { MenusService } from './menu.service';
import { MenusController } from './menu.controller';

@Module({
  imports: [],
  providers: [MenusService],
  controllers: [MenusController],
})
export class MenusModule {}
