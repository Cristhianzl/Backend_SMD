import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { buildFinalMenu } from './factory/build-return-data';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';

@Injectable()
export class MenusService {
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
      `select * from ${this.tenant}.menus order by created_at desc`,
    );
    const countData = await this.dbConnection.query(
      `select count(*) from ${this.tenant}.menus `,
    );

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.dbConnection.query(
      `select * from ${this.tenant}.menus where id = '${id}'`,
    );
  }

  async findWithFilter(filters: any, page: number, pagesize: number) {
    let filtersQuery: string = '';
    let queryCount: string = '';

    if (filters?.name) {
      filtersQuery = filtersQuery + ` and name like '%${filters.name}%' `;
    }

    const query = `select * from ${this.tenant}.menus where 1=1 ${filtersQuery} 
    group by created_at, id, name order by is_active desc, created_at desc limit ${pagesize} offset ${
      page * pagesize
    }`;

    const numberActives = await this.dbConnection.query(
      `select count(*) from ${this.tenant}.menus where is_active = true`,
    );

    const more = await this.dbConnection.query(
      `select category_id, menu_id from ${this.tenant}.menu_categories`,
    );

    queryCount = `select count(*) from ${this.tenant}.menus where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const data = await this.dbConnection.query(query);
    const countData = await this.dbConnection.query(queryCount);

    const count = Number(countData?.rows[0].count ?? 0);
    const hasActive = Number(numberActives[0]?.count ?? 0) > 0;

    data?.rows?.forEach((element) => {
      element.categories = more?.rows?.filter((x) => x.menu_id === element.id);
    });
    return {
      data,
      count,
      hasActive,
    };
  }

  async add(input) {
    const uuidValue = uuid();

    try {
      const data = await this.dbConnection.query(
        `insert into ${this.tenant}.menus (id, name, is_active, created_at) values ('${uuidValue}', '${input.name}', false, NOW() - interval '3 hour') returning *`,
      );
      if (input?.categories?.length > 0) {
        input.categories.forEach(async (element, index) => {
          await this.dbConnection.query(
            `insert into ${
              this.tenant
            }.menu_categories (id, menu_id, category_id, order_view) values ('${uuid()}', '${uuidValue}', '${element}', ${index})`,
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

    const data = await this.dbConnection.query(
      `update ${this.tenant}.menus set name = '${input.name}', ${values} updated_at = (NOW() - interval '3 hour') where id = '${input.id}' returning *`,
    );

    if (input?.categories?.length > 0) {
      await this.dbConnection.query(
        `delete from ${this.tenant}.menu_categories where menu_id = '${input.id}'`,
      );

      for (let i = 0; i < input.categories.length; i++) {
        await this.dbConnection.query(
          `insert into ${
            this.tenant
          }.menu_categories (id, menu_id, category_id, order_view) values ('${uuid()}', '${
            input.id
          }', '${input.categories[i]}', ${i})`,
        );
      }
    }

    return data.rows[0];
  }

  async remove(id: string) {
    const data = await this.dbConnection.query(
      `delete from ${this.tenant}.menus where id = '${id}' returning *`,
    );

    await this.dbConnection.query(
      `delete from ${this.tenant}.menu_categories where menu_id = '${id}'`,
    );

    return data;
  }

  async hasActive() {
    const data = await this.dbConnection.query(
      `select from ${this.tenant}.menus where is_active = true`,
    );
    return data.length > 0;
  }

  async getActive() {
    const tenantName = await this.dbConnection.query(
      `select name, tenant_img from public.tenants where tenant_name = '${this.tenant}'`,
    );

    if (tenantName.rows.length === 0) {
      throw new HttpException(
        'Empresa não encontrada',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const hasActive = await this.dbConnection.query(
      `select * from ${this.tenant}.menus where is_active = true`,
    );

    if (hasActive.rowCount > 0) {
      const data = await this.dbConnection.query(
        `SELECT m.NAME,
        mc.order_view AS category_order_view,
        cp.order_view AS product_order_view,
        c.NAME as category_name,
        c.url_img as category_img,
        p.id,
        p.NAME as product_name,
        p.discount_value,
        p.price,
        p.on_sale,
        p.discount_type,
        p.url_img as product_img,
        p.description,
        p.is_gluten_free,
        p.is_vegan,
        p.is_vegetarian,
        c.id as category_id,
        cp.category_id as bind_category_id,
        cp.product_id as bind_product_id,
        p.id as product_id
 FROM   ${this.tenant}.menus m
        INNER JOIN ${this.tenant}.menu_categories mc
                ON mc.menu_id = m.id
        INNER JOIN ${this.tenant}.category_products cp
                ON mc.category_id = cp.category_id
        INNER JOIN ${this.tenant}.categories c
                ON c.id = mc.category_id
        INNER JOIN ${this.tenant}.products p
                ON p.id = cp.product_id
 WHERE  m.is_active = true order by mc.order_view , cp.order_view `,
      );

      if (data.rowCount === 0) {
        throw new HttpException('Nenhum menu ativo.', HttpStatus.NOT_FOUND);
      }

      let menuFinal = buildFinalMenu(data.rows);

      // Ordena os produtos por desconto primeiro
      let discountedProducts = [];
      let nonDiscountedProducts = [];
      for (let i = 0; i < menuFinal.categories.length; i++) {
        discountedProducts = discountedProducts.concat(
          menuFinal.categories[i].products.filter(
            (x) => x.discount_type && x.discount_value,
          ),
        );
        nonDiscountedProducts = nonDiscountedProducts.concat(
          menuFinal.categories[i].products.filter(
            (x) => !x.discount_type || !x.discount_value,
          ),
        );
        menuFinal.categories[i].products = discountedProducts.concat(
          nonDiscountedProducts,
        );
        discountedProducts = [];
        nonDiscountedProducts = [];
      }

      menuFinal = {
        ...menuFinal,
        tenant: tenantName.rows[0].name,
        img: tenantName.rows[0].tenant_img,
      };
      return menuFinal;
    } else {
      throw new HttpException('Nenhum menu ativo.', HttpStatus.NOT_FOUND);
    }
  }

  async activeMenu(id: string) {
    await this.dbConnection.query(
      `update ${this.tenant}.menus set is_active = false where is_active = true`,
    );

    const data = await this.dbConnection.query(
      `update ${this.tenant}.menus set is_active = true where id = '${id}' returning *`,
    );

    return data;
  }
}
