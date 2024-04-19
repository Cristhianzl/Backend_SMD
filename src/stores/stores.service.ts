import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
@Injectable()
export class StoresService {
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
      `select * from ${this.tenant}.stores order by created_at desc`,
    );
    const countData = await this.dbConnection.query(
      `select count(*) from ${this.tenant}.stores `,
    );

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.dbConnection.query(
      `select * from ${this.tenant}.stores where id = '${id}'`,
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
    }.stores where 1=1 ${filtersQuery} 
    group by created_at, id, name order by created_at desc limit ${pagesize} offset ${
      page * pagesize
    }`;

    queryCount = `select count(*) from ${this.tenant}.stores where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const data = await this.dbConnection.query(query);
    const countData = await this.dbConnection.query(queryCount);

    const count = Number(countData?.rowCount ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    const data = await this.dbConnection.query(
      `insert into ${
        this.tenant
      }.stores (id, name, created_at) values ('${uuid()}', '${
        input.name
      }', NOW() - interval '3 hour') returning *`,
    );

    return data;
  }

  async edit(input) {
    const data = await this.dbConnection.query(
      `update ${this.tenant}.stores set name = '${input.name}' where id = '${input.id}' returning *`,
    );

    return data[0];
  }

  async remove(id: string) {
    const data = await this.dbConnection.query(
      `delete from ${this.tenant}.stores where id = '${id}' returning *`,
    );

    return data;
  }
}
