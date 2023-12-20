import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from 'src/entities/tenant.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TenantsService {
  tenant: string;

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
  ) {}

  setTenant(tenant: string) {
    this.tenant = 'public';
  }

  async listAll() {
    const data = await this.tenantsRepository.query(
      `select * from ${this.tenant}.tenants order by created_at desc`,
    );
    const countData = await this.tenantsRepository.query(
      `select count(*) from ${this.tenant}.tenants `,
    );

    const count = Number(countData[0].count);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.tenantsRepository.query(
      `select * from ${this.tenant}.tenants where id = '${id}'`,
    );
  }

  async findWithFilter(filters: any, page: number, pagesize: number) {
    let filtersQuery: string = '';
    let queryCount: string = '';

    if (filters?.name) {
      filtersQuery = filtersQuery + ` and name like '%${filters.name}%' `;
    }

    const query = `select * from ${this.tenant}.tenants where 1=1 ${filtersQuery} 
        group by created_at, id, name order by created_at desc limit ${pagesize} offset ${page}`;

    queryCount = `select count(*) from ${this.tenant}.tenants where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const data = await this.tenantsRepository.query(query);
    const countData = await this.tenantsRepository.query(queryCount);

    const count = Number(countData[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    const data = await this.tenantsRepository.query(
      `insert into ${
        this.tenant
      }.tenants (id, name, tenant_name, created_at) values ('${uuid()}', '${
        input.name
      }', '${this.createTenantName(
        input.name,
      )}' , NOW() - interval '3 hour') returning *`,
    );

    return data;
  }

  createTenantName(name) {
    const stringWithoutSpecialCharsAndSpaces = name
      .replace(/[^\w]/g, '')
      .toLowerCase();
    const nameWithFixedNumberOfChars =
      stringWithoutSpecialCharsAndSpaces.substring(0, 10);
    const nameWithRandomNumbers = `${nameWithFixedNumberOfChars}${Math.floor(
      Math.random() * 11,
    )}${Math.floor(Math.random() * 11)}${Math.floor(
      Math.random() * 11,
    )}${Math.floor(Math.random() * 11)}`;
    return nameWithRandomNumbers.trim();
  }

  async remove(id: string) {
    const data = await this.tenantsRepository.query(
      `delete from ${this.tenant}.tenants where id = '${id}' returning *`,
    );

    return data;
  }
}
