import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TenantsService } from 'src/tenants/tenants.service';
import { EmailService } from 'src/email/email.service';
import { SendGridClient } from 'src/email/sendgrid-client';

@Module({
  providers: [UsersService, TenantsService, EmailService, SendGridClient],
  exports: [UsersService],
  controllers: [UsersController],
  imports: [],
})
export class UsersModule {}
