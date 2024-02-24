import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Tenant } from 'src/entities/tenant.entity';
import { TenantsService } from 'src/tenants/tenants.service';
import { JwtService } from '@nestjs/jwt';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
import * as moment from 'moment';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scrypt,
} from 'crypto';
import { promisify } from 'util';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class UsersService {
  tenant: string;
  passwordEncryption: string = 'hashkeymmd';
  ivEncryption: string = 'smslt';
  encryptMethod: string = 'aes-256-cbc';
  key: string = createHash('sha512')
    .update(this.passwordEncryption, 'utf-8')
    .digest('hex')
    .substring(0, 32);
  iv = createHash('sha512')
    .update(this.passwordEncryption, 'utf-8')
    .digest('hex')
    .substring(0, 16);

  constructor(
    @InjectConnection('dbConnection')
    private dbConnection: Client,
    private readonly tenantService: TenantsService,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
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

  async edit(input, token) {
    let values: string = '';
    const access = await this.jwtService.decode(token.split(' ')[1]);

    const user = await this.dbConnection.query(
      `select * from ${this.tenant}.users where username = '${access.username}'`,
    );

    if (user.rows.length === 0) {
      throw new HttpException(
        'Usuário inválido',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (input.username) {
      values = values + `name = '${input.username}',`;
    }

    if (input?.password && input?.oldPassword && input?.password2) {
      input.password = atob(input.password);
      input.password2 = atob(input.password2);
      input.oldPassword = atob(input.oldPassword);

      if (input.password !== input.password2) {
        throw new HttpException(
          'Senhas não conferem',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const match = await bcrypt.compare(
        input.oldPassword,
        user.rows[0].password,
      );

      if (!match) {
        throw new HttpException(
          'Senha atual incorreta',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const saltOrRounds = 10;
      const hash = await bcrypt.hash(input.password, saltOrRounds);

      values = values + `password = '${hash}',`;
    }

    if (input.tenantName || input.tenantImg) {
      const tenant = await this.dbConnection.query(
        `select * from public.tenants where tenant_name = '${access.tenantName}'`,
      );

      if (tenant.rows.length === 0) {
        throw new HttpException(
          'Tenant não encontrado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (input.tenantName) {
        await this.dbConnection.query(
          `update public.tenants set name = '${input.tenantName}', updated_at = now() where tenant_name = '${access.tenantName}'`,
        );
      }

      if (input.tenantImg) {
        await this.dbConnection.query(
          `update public.tenants set tenant_img = '${input.tenantImg}', updated_at = now() where tenant_name = '${access.tenantName}'`,
        );
      }
    }

    const data = await this.dbConnection.query(
      `update ${this.tenant}.users set ${values}
      updated_at = NOW() - interval '3 hour'
      where id = '${user.rows[0].id}' returning *`,
    );

    const newUser = {
      id: data.rows[0].id,
      username: data.rows[0].username,
      name: data.rows[0].name,
      tenant: data.rows[0].tenant_name,
    };

    return newUser;
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

  async generateKey(user: string) {
    const encryptor = createCipheriv(this.encryptMethod, this.key, this.iv);
    const aesEncrypted =
      encryptor.update(user, 'utf-8', 'base64') + encryptor.final('base64');
    const encryptedText = Buffer.from(aesEncrypted).toString('base64');

    const formattedDateTime = moment().add(-3, 'hours').format();

    const hash = btoa(formattedDateTime) + '/' + encryptedText;

    this.emailService.sendEmailWithTemplate(atob(user), hash);

    return hash;
  }

  async recoveryPassword(hash: string, newPassword: string) {
    const hashDate = atob(hash.split('/')[0]); // Assuming hash is defined elsewhere
    let encryptedText = hash.split('/')[1]; // Assuming hash is defined elsewhere
    const currentDate = moment().add(-3, 'hours').format();

    // Calculate the difference in minutes
    const differenceInMinutes = moment(currentDate).diff(hashDate, 'minutes');

    // Check if the difference is less than or equal to 3 minutes
    if (differenceInMinutes >= 3) {
      throw new HttpException(
        'Chave inválida',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const buff = Buffer.from(encryptedText, 'base64');
    encryptedText = buff.toString('utf-8');
    const decryptor = createDecipheriv(this.encryptMethod, this.key, this.iv);
    const decryptedText =
      decryptor.update(encryptedText, 'base64', 'utf-8') +
      decryptor.final('utf-8');

    const emailToUpdate = atob(decryptedText);
    const user = await this.dbConnection.query(
      `select * from ${this.tenant}.users where email = '${emailToUpdate}'`,
    );

    if (user.rows.length === 0) {
      throw new HttpException(
        'User não encontrado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const saltOrRounds = 10;
    const hashPassword = await bcrypt.hash(newPassword, saltOrRounds);

    const data = await this.dbConnection.query(
      `update ${this.tenant}.users set password = '${hashPassword}' where email = '${emailToUpdate}'`,
    );

    return 'Senha alterada com sucesso';
  }
}
