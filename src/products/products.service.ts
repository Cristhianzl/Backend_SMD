import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProductsService {
  tenant: string;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  setTenant(tenant: string) {
    this.tenant = tenant;
  }

  async listAll() {
    const data = await this.productsRepository.query(
      `select * from ${this.tenant}.products order by created_at desc`,
    );
    const countData = await this.productsRepository.query(
      `select count(*) from ${this.tenant}.products `,
    );

    const count = Number(countData[0].count);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.productsRepository.query(
      `select * from ${this.tenant}.products where id = '${id}'`,
    );
  }

  async findWithFilter(filters: any, page: number, pagesize: number) {
    let filtersQuery: string = '';
    let queryCount: string = '';

    if (filters?.name) {
      filtersQuery = filtersQuery + ` and name like '%${filters.name}%' `;
    }

    const query = `select * from ${this.tenant}.products where 1=1 ${filtersQuery} 
    group by created_at, id, name order by created_at desc limit ${pagesize} offset ${page}`;

    queryCount = `select count(*) from ${this.tenant}.products where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const data = await this.productsRepository.query(query);
    const countData = await this.productsRepository.query(queryCount);

    const count = Number(countData[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    let values: string = '';
    let columns: string = '';

    if (input.category_id) {
      values = values + `'${input.category_id}',`;
      columns = columns + 'category_id,';
    }
    if (input.discount_id) {
      values = values + `'${input.discount_id}',`;
      columns = columns + 'discount_id,';
    }

    const data = await this.productsRepository.query(
      `insert into ${
        this.tenant
      }.products (id, name, ${columns} price, on_sale, created_at) values ('${uuid()}', '${
        input.name
      }',${values} '${input.price ?? 0}', '${
        input.on_sale ?? false
      }', NOW() - interval '3 hour') returning *`,
    );

    return data;
  }

  async edit(input) {
    let values: string = '';

    if (input.category_id) {
      values = values + `category_id = '${input.category_id}',`;
    }
    if (input.discount_id) {
      values = values + `discount_id = '${input.discount_id}',`;
    }

    const data = await this.productsRepository.query(
      `update ${this.tenant}.products set name = '${input.name}', ${values}
      price = '${input.price ?? 0}', on_sale = '${input.on_sale ?? false}',
      updated_at = NOW() - interval '3 hour'
      where id = '${input.id}' returning *`,
    );

    return data[0];
  }

  async remove(id: string) {
    const data = await this.productsRepository.query(
      `delete from ${this.tenant}.products where id = '${id}' returning *`,
    );

    return data;
  }
}
