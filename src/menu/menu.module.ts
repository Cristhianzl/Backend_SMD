import { Module } from '@nestjs/common';
import { MenusService } from './menu.service';
import { MenusController } from './menu.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 60,
      max: 100,
    }),
  ],
  providers: [MenusService],
  controllers: [MenusController],
})
export class MenusModule {}
