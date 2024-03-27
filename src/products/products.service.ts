import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
@Injectable()
export class ProductsService {
  tenant: string;

  constructor(
    @InjectConnection('dbConnection')
    private dbConnection: Client,
  ) {}

  setTenant(tenant: string) {
    this.tenant = tenant;
  }

  async listAll() {
    const data = await this.dbConnection.query(
      `select * from ${this.tenant}.products order by created_at desc`,
    );
    const countData = await this.dbConnection.query(
      `select count(*) from ${this.tenant}.products `,
    );

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.dbConnection.query(
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

    const more = await this.dbConnection.query(
      `select category_id, product_id from ${this.tenant}.category_products`,
    );

    const data = await this.dbConnection.query(query);
    const countData = await this.dbConnection.query(queryCount);

    data?.rows?.forEach((element) => {
      element.categories = more?.rows?.filter(
        (x) => x.product_id === element.id,
      );
    });

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    let values: string = '';
    let columns: string = '';
    const uuidValue = uuid();

    if (input.category_id != null) {
      values = values + `'${input.category_id}',`;
      columns = columns + 'category_id,';
    }
    if (input.discount_type && input.discount_value) {
      values = values + `'${input.discount_type}',`;
      values = values + `'${input.discount_value}',`;

      columns = columns + 'discount_type,';
      columns = columns + 'discount_value,';
    }
    if (input.url_img != null) {
      values = values + `'${input.url_img}',`;
      columns = columns + 'url_img,';
    }
    if (input.description != null) {
      values = values + `'${input.description}',`;
      columns = columns + 'description,';
    }

    if (input.is_vegan != null) {
      values = values + `'${input.is_vegan}',`;
      columns = columns + 'is_vegan,';
    }

    if (input.is_vegetarian != null) {
      values = values + `'${input.is_vegetarian}',`;
      columns = columns + 'is_vegetarian,';
    }

    if (input.is_gluten_free != null) {
      values = values + `'${input.is_gluten_free}',`;
      columns = columns + 'is_gluten_free,';
    }

    try {
      const data = await this.dbConnection.query(
        `insert into ${
          this.tenant
        }.products (id, name, ${columns} price, on_sale, created_at) values ('${uuidValue}', '${
          input.name
        }',${values} ${input.price ?? 0}, '${
          input.on_sale ?? false
        }', NOW() - interval '3 hour') returning *`,
      );

      if (input?.categories?.length > 0) {
        input.categories.forEach(async (element) => {
          await this.dbConnection.query(
            `insert into ${
              this.tenant
            }.category_products (id, product_id, category_id) values ('${uuid()}', '${uuidValue}', '${element}')`,
          );
        });
      }
      return data;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async edit(input) {
    let values: string = '';

    if (input.discount_value && input.discount_type) {
      values = values + `discount_value = '${input.discount_value}',`;
      values = values + `discount_type = '${input.discount_type}',`;
    }

    if (input.url_img != null) {
      values = values + `url_img = '${input.url_img}',`;
    }

    if (input.description != null) {
      values = values + `description = '${input.description}',`;
    }

    if (input.is_vegan != null) {
      values = values + `is_vegan = '${input.is_vegan}',`;
    }

    if (input.is_vegetarian != null) {
      values = values + `is_vegetarian = '${input.is_vegetarian}',`;
    }

    if (input.is_gluten_free != null) {
      values = values + `is_gluten_free = '${input.is_gluten_free}',`;
    }

    try {
      const data = await this.dbConnection.query(
        `update ${this.tenant}.products set name = '${input.name}', ${values}
        price = ${input.price ?? 0}, on_sale = '${input.on_sale ?? false}',
        updated_at = NOW() - interval '3 hour'
        where id = '${input.id}' returning *`,
      );

      if (input?.categories?.length > 0) {
        await this.dbConnection.query(
          `delete from ${this.tenant}.category_products where product_id = '${input.id}'`,
        );

        input.categories?.forEach(async (element) => {
          await this.dbConnection.query(
            `insert into ${
              this.tenant
            }.category_products (id, product_id, category_id) values ('${uuid()}', '${
              input.id
            }', '${element}')`,
          );
        });
      }
      return data[0];
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async remove(id: string) {
    const data = await this.dbConnection.query(
      `delete from ${this.tenant}.products where id = '${id}' returning *`,
    );

    return data;
  }
}
