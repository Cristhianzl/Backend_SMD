import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { Tenant } from 'src/entities/tenant.entity';
import { TenantsService } from './tenants.service';

@Module({
  imports: [],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
