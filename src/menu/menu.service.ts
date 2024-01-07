import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Menu } from './dto/get-menu.dto';
import { Store } from 'src/entities/store.entity';

@Injectable()
export class MenusService {
  tenant: string;

  constructor(
    @InjectRepository(Menu)
    private readonly menusRepository: Repository<Menu>,
  ) {}

  setTenant(tenant: string) {
    this.tenant = tenant;
  }

  async listAll() {
    const data = await this.menusRepository.query(
      `select * from ${this.tenant}.menus order by created_at desc`,
    );
    const countData = await this.menusRepository.query(
      `select count(*) from ${this.tenant}.menus `,
    );

    const count = Number(countData[0].count);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.menusRepository.query(
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
    group by created_at, id, name order by created_at desc limit ${pagesize} offset ${page}`;

    queryCount = `select count(*) from ${this.tenant}.menus where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const data = await this.menusRepository.query(query);
    const countData = await this.menusRepository.query(queryCount);

    const count = Number(countData[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    const uuidValue = uuid();

    const data = await this.menusRepository.query(
      `insert into ${this.tenant}.menus (id, name, is_active, created_at) values ('${uuidValue}', '${input.name}', false,NOW() - interval '3 hour') returning *`,
    );

    if (input.categories.length > 0) {
      input.categories.forEach(async (element) => {
        await this.menusRepository.query(
          `insert into ${
            this.tenant
          }.menu_categories (id, menu_id, category_id) values ('${uuid()}', '${uuidValue}', '${element}')`,
        );
      });
    }

    return data;
  }

  async edit(input) {
    let values: string = '';

    if (input.is_active) {
      values = values + `is_active = '${input.is_active}',`;
    }

    if (input.is_active === true) {
      await this.menusRepository.query(
        `update ${this.tenant}.menus set is_active = false where is_active = true`,
      );
    }

    const data = await this.menusRepository.query(
      `update ${this.tenant}.menus set name = '${input.name}', ${values} updated_at = (NOW() - interval '3 hour') where id = '${input.id}' returning *`,
    );

    if (input.categories?.length > 0) {
      await this.menusRepository.query(
        `delete from ${this.tenant}.menu_categories where menu_id = '${input.id}'`,
      );

      input.categories?.forEach(async (element) => {
        await this.menusRepository.query(
          `insert into ${
            this.tenant
          }.menu_categories (id, menu_id, category_id) values ('${uuid()}', '${
            input.id
          }', '${element}')`,
        );
      });
    }

    return data[0];
  }

  async remove(id: string) {
    const data = await this.menusRepository.query(
      `delete from ${this.tenant}.menus where id = '${id}' returning *`,
    );

    await this.menusRepository.query(
      `delete from ${this.tenant}.menu_categories where menu_id = '${id}'`,
    );

    return data;
  }
}
