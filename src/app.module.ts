import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsService } from './tenants/tenants.service';
import { TenantsModule } from './tenants/tenants.module';
import { CategoriesModule } from './categories/categories.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ProductsModule } from './products/products.module';
import { StoresModule } from './stores/stores.module';
import { MenusModule } from './menu/menu.module';
import { HttpExceptionFilter } from './shared/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { PostgresModule } from 'nest-postgres';

@Module({
  imports: [
    PostgresModule.forRoot(
      {
        connectionString:
          'postgresql://postgres:password@localhost/menudigital',
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
