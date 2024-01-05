import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsService } from './tenants/tenants.service';
import { TenantsModule } from './tenants/tenants.module';
import { CategoriesModule } from './categories/categories.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ProductsModule } from './products/products.module';
import { StoresModule } from './stores/stores.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusModule } from './menu/menu.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: 'postgres',
      password: 'password',
      database: 'menudigital',
      synchronize: false,
      logging: true,
      autoLoadEntities: true,
    }),
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
  providers: [],
})
export class AppModule {}
