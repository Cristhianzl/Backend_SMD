import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { Tenant } from 'src/entities/tenant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsService } from './tenants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
