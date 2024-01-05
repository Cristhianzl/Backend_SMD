import { Module } from '@nestjs/common';
import { Store } from 'src/entities/store.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusService } from './menu.service';
import { MenusController } from './menu.controller';
import { Menu } from './dto/get-menu.dto';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  providers: [MenusService],
  controllers: [MenusController],
})
export class MenusModule {}
