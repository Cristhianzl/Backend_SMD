import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class CategoriesService {
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
      `select * from ${this.tenant}.categories order by created_at desc`,
    );
    const countData = await this.dbConnection.query(
      `select count(*) from ${this.tenant}.categories `,
    );

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.dbConnection.query(
      `select * from ${this.tenant}.categories where id = '${id}'`,
    );
  }

  async findWithFilter(filters: any, page: number, pagesize: number) {
    let filtersQuery: string = '';
    let queryCount: string = '';

    if (filters?.name) {
      filtersQuery = filtersQuery + ` and name like '%${filters.name}%' `;
    }

    const query = `select * from ${
      this.tenant
    }.categories where 1=1 ${filtersQuery} 
    group by created_at, id, name order by created_at desc limit ${pagesize} offset ${
      page * pagesize
    }`;

    queryCount = `select count(*) from ${this.tenant}.categories where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const more = await this.dbConnection.query(
      `
      select cp.category_id, cp.product_id, p.name
      from ${this.tenant}.category_products cp 
      inner join ${this.tenant}.products p 
      on p.id = cp.product_id 
      order by order_view asc
      `,
    );

    const data = await this.dbConnection.query(query);
    const countData = await this.dbConnection.query(queryCount);

    data?.rows?.forEach((element) => {
      element.products = more?.rows?.filter(
        (x) => x.category_id === element.id,
      );
      element.products_name = more?.rows
        ?.filter((x) => x.category_id === element.id)
        .map((x) => x.name);
    });

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    const uuidValue = uuid();

    const data = await this.dbConnection.query(
      `insert into ${
        this.tenant
      }.categories (id, name, url_img, created_at) values ('${uuidValue}', '${
        input.name
      }', '${input.url_img ?? null}', NOW() - interval '3 hour') returning *`,
    );

    if (input.products.length > 0) {
      input.products.forEach(async (element, index) => {
        await this.dbConnection.query(
          `insert into ${
            this.tenant
          }.category_products (id, category_id, product_id, order_view) values ('${uuid()}', '${uuidValue}', '${element}', ${index})`,
        );
      });
    }

    return data;
  }

  async edit(input) {
    const data = await this.dbConnection.query(
      `update ${this.tenant}.categories set name = '${
        input.name
      }', url_img = '${input.url_img ?? null}' where id = '${
        input.id
      }' returning *`,
    );

    if (input.products?.length > 0) {
      await this.dbConnection.query(
        `delete from ${this.tenant}.category_products where category_id = '${input.id}'`,
      );

      input.products?.forEach(async (element, index) => {
        await this.dbConnection.query(
          `insert into ${
            this.tenant
          }.category_products (id, category_id, product_id, order_view) values ('${uuid()}', '${
            input.id
          }', '${element}', ${index})`,
        );
      });
    }

    return data[0];
  }

  async remove(id: string) {
    const categoriesOnActiveMenu = await this.dbConnection.query(
      `select * from ${this.tenant}.menus m 
      inner join ${this.tenant}.menu_categories mc on m.id = mc.menu_id 
      inner join ${this.tenant}.category_products cp on cp.category_id = mc.category_id 
      where mc.category_id = '${id}' and m.is_active = true`,
    );

    if (categoriesOnActiveMenu?.rows?.length > 0) {
      throw new HttpException(
        'Produto cadastrado em um menu ativo.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.dbConnection.query(
      `delete from ${this.tenant}.category_products where category_id = '${id}'
      `,
    );

    await this.dbConnection.query(
      `
        delete from ${this.tenant}.menu_categories where category_id = '${id}'
      `,
    );

    const data = await this.dbConnection.query(
      `delete from ${this.tenant}.categories where id = '${id}' returning *`,
    );

    return data;
  }
}
