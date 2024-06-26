import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { CategoriesModule } from './categories/categories.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ProductsModule } from './products/products.module';
import { StoresModule } from './stores/stores.module';
import { MenusModule } from './menu/menu.module';
import { HttpExceptionFilter } from './shared/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { PostgresModule } from 'nest-postgres';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { FileUploaderModule } from './file-uploader/file-uploader.module';
import { FeedbackModule } from './feedback/feedback.module';
console.log(process.env.DB_USER, process.env.DB_PASS);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PostgresModule.forRoot(
      {
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        database: process.env.DB_DATABASE,
      },
      'dbConnection',
    ),
    AuthModule,
    UsersModule,
    TenantsModule,
    CategoriesModule,
    DiscountsModule,
    ProductsModule,
    StoresModule,
    MenusModule,
    EmailModule,
    FileUploaderModule,
    FeedbackModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
