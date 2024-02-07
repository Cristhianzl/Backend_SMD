import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TenantsService } from 'src/tenants/tenants.service';

@Module({
  providers: [UsersService, TenantsService],
  exports: [UsersService],
  controllers: [UsersController],
  imports: [],
})
export class UsersModule {}
