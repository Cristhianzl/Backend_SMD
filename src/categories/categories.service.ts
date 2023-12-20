import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CategoriesService {
  tenant: string;

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  setTenant(tenant: string) {
    this.tenant = tenant;
  }

  async listAll() {
    const data = await this.categoriesRepository.query(
      `select * from ${this.tenant}.categories order by created_at desc`,
    );
    const countData = await this.categoriesRepository.query(
      `select count(*) from ${this.tenant}.categories `,
    );

    const count = Number(countData[0].count);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.categoriesRepository.query(
      `select * from ${this.tenant}.categories where id = '${id}'`,
    );
  }

  async findWithFilter(filters: any, page: number, pagesize: number) {
    let filtersQuery: string = '';
    let queryCount: string = '';

    if (filters?.name) {
      filtersQuery = filtersQuery + ` and name like '%${filters.name}%' `;
    }

    const query = `select * from ${this.tenant}.categories where 1=1 ${filtersQuery} 
    group by created_at, id, name order by created_at desc limit ${pagesize} offset ${page}`;

    queryCount = `select count(*) from ${this.tenant}.categories where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const data = await this.categoriesRepository.query(query);
    const countData = await this.categoriesRepository.query(queryCount);

    const count = Number(countData[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    const data = await this.categoriesRepository.query(
      `insert into ${
        this.tenant
      }.categories (id, name, url_img, created_at) values ('${uuid()}', '${
        input.name
      }', '${input.url_img ?? null}', NOW() - interval '3 hour') returning *`,
    );

    return data;
  }

  async edit(input) {
    const data = await this.categoriesRepository.query(
      `update ${this.tenant}.categories set name = '${
        input.name
      }', url_img = '${input.url_img ?? null}' where id = '${
        input.id
      }' returning *`,
    );

    return data[0];
  }

  async remove(id: string) {
    const data = await this.categoriesRepository.query(
      `delete from ${this.tenant}.categories where id = '${id}' returning *`,
    );

    return data;
  }
}
