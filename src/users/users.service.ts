import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { promisify } from 'util';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  tenant: string;

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  setTenant(tenant: string) {
    this.tenant = 'public';
  }

  async listAll() {
    const data = await this.usersRepository.query(
      `select * from ${this.tenant}.users order by created_at desc`,
    );
    const countData = await this.usersRepository.query(
      `select count(*) from ${this.tenant}.users `,
    );

    const count = Number(countData[0].count);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.usersRepository.query(
      `select * from ${this.tenant}.users where id = '${id}'`,
    );
  }

  async findWithFilter(filters: any, page: number, pagesize: number) {
    let filtersQuery: string = '';
    let queryCount: string = '';

    if (filters?.name) {
      filtersQuery = filtersQuery + ` and name like '%${filters.name}%' `;
    }

    const query = `select * from ${this.tenant}.users where 1=1 ${filtersQuery} 
    group by created_at, id order by created_at desc limit ${pagesize} offset ${page}`;

    queryCount = `select count(*) from ${this.tenant}.users where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const data = await this.usersRepository.query(query);
    const countData = await this.usersRepository.query(queryCount);

    const count = Number(countData[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(input.password, saltOrRounds);

    let data = await this.usersRepository.query(
      `insert into ${
        this.tenant
      }.users (id, username, password, is_admin, tenant_id, name, email, created_at) values ('${uuid()}', 
      '${input.username}', '${hash}', '${input.is_admin}', '${
        input.tenant_id
      }', '${input.name}', '${input.email}'
      , NOW() - interval '3 hour') returning *`,
    );

    data[0].password = '*********';

    return data;
  }

  async edit(input) {
    let values: string = '';

    if (input.name) {
      values = values + `name = '${input.name}',`;
    }
    if (input.email) {
      values = values + `email = '${input.email}',`;
    }

    const data = await this.usersRepository.query(
      `update ${this.tenant}.users set ${values}
      updated_at = NOW() - interval '3 hour'
      where id = '${input.id}' returning *`,
    );

    return data[0];
  }

  async remove(id: string) {
    const data = await this.usersRepository.query(
      `delete from ${this.tenant}.users where id = '${id}' returning *`,
    );

    return data;
  }

  async findOne(username: string): Promise<any> {
    return this.users.find((user) => user.username === username);
  }
}
