import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Tenant } from 'src/entities/tenant.entity';
import { TenantsService } from 'src/tenants/tenants.service';
import { JwtService } from '@nestjs/jwt';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
@Injectable()
export class UsersService {
  tenant: string;

  constructor(
    @InjectConnection('dbConnection')
    private dbConnection: Client,
    private readonly tenantService: TenantsService,
    private jwtService: JwtService,
  ) {
    this.setTenant('public');
  }

  setTenant(tenant: string) {
    this.tenant = 'public';
  }

  async listAll() {
    const data = await this.dbConnection.query(
      `select * from ${this.tenant}.users order by created_at desc`,
    );
    const countData = await this.dbConnection.query(
      `select count(*) from ${this.tenant}.users `,
    );

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.dbConnection.query(
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

    const data = await this.dbConnection.query(query);
    const countData = await this.dbConnection.query(queryCount);

    const count = Number(countData?.rowCount ?? 0);

    return {
      data,
      count,
    };
  }

  async add(input) {
    const user = await this.dbConnection.query(
      `select * from ${this.tenant}.users where username = '${input.username}'`,
    );

    const email = await this.dbConnection.query(
      `select * from ${this.tenant}.users where email = '${input.email}'`,
    );

    if (user.length > 0) {
      throw new HttpException(
        'Usuário ou Email já cadastrado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (email.length > 0) {
      throw new HttpException(
        'Usuário ou Email já cadastrado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const tenantCreation = {
      name: input.username,
      tenant_name: input.company,
      tenant_img: null,
    };

    const newTenant = await this.tenantService.add(tenantCreation);

    if (newTenant.length === 0) {
      throw new HttpException(
        'Ocorreu um erro ao realizar seu cadastro, tente novamente.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await this.tenantService.runMigrations(newTenant[0].tenant_name);
    } catch (e) {
      await this.dbConnection.query(
        `delete from public.tenants where id = '${newTenant[0].id}'`,
      );
      throw new HttpException(
        'Ocorreu um erro ao realizar seu cadastro, tente novamente.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(input.password, saltOrRounds);

    let data = await this.dbConnection.query(
      `insert into public.users (id, username, password, is_admin, tenant_id, name, email, created_at) values ('${uuid()}', 
      '${input.username}', '${hash}', 'false', '${newTenant[0].id}', '${
        input.username
      }', '${input.email}'
      , NOW() - interval '3 hour') returning *`,
    );

    const returnData = {
      id: data[0].id,
      username: data[0].username,
      name: data[0].name,
      email: data[0].email,
      tenant: newTenant[0].tenant_name,
    };

    return returnData;
  }

  async edit(input) {
    let values: string = '';

    if (input.name) {
      values = values + `name = '${input.name}',`;
    }
    if (input.email) {
      values = values + `email = '${input.email}',`;
    }

    const data = await this.dbConnection.query(
      `update ${this.tenant}.users set ${values}
      updated_at = NOW() - interval '3 hour'
      where id = '${input.id}' returning *`,
    );

    return data[0];
  }

  async remove(token: string) {
    const access = await this.jwtService.decode(token.split(' ')[1]);
    const data = await this.dbConnection.query(
      `delete from ${this.tenant}.users where id = '${access.id}' returning *`,
    );

    return data;
  }

  async findOne(username: string): Promise<any> {
    return await this.dbConnection.query(
      `
      select ${this.tenant}.users.*, ${this.tenant}.tenants.tenant_name from ${this.tenant}.users
      inner join ${this.tenant}.tenants on ${this.tenant}.users.tenant_id = ${this.tenant}.tenants.id where username = '${username}'
      `,
    );
  }

  async findOneEmail(email: string): Promise<any> {
    return await this.dbConnection.query(
      `select ${this.tenant}.users.*, ${this.tenant}.tenants.tenant_name from ${this.tenant}.users
      inner join ${this.tenant}.tenants on ${this.tenant}.users.tenant_id = ${this.tenant}.tenants.id where email = '${email}'`,
    );
  }

  async findOneById(id: string): Promise<any> {
    return await this.dbConnection.query(
      `select * from ${this.tenant}.users where id = '${id}'`,
    );
  }
}
