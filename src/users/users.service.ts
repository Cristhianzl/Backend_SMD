import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { TenantsService } from 'src/tenants/tenants.service';
import { JwtService } from '@nestjs/jwt';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
import * as moment from 'moment';
import { EmailService } from 'src/email/email.service';
import Stripe from 'stripe';
import { decrypt, encrypt } from 'src/shared/helpers/encrypt-decrypt';

@Injectable()
export class UsersService {
  tenant: string;
  stripe: any;

  constructor(
    @InjectConnection('dbConnection')
    private dbConnection: Client,
    private readonly tenantService: TenantsService,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {
    this.setTenant('public');
    this.setStripeKey();
  }

  setTenant(tenant: string) {
    this.tenant = 'public' ?? tenant;
  }

  setStripeKey() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
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
    const tenant = await this.dbConnection.query(
      `select * from public.tenants where name = '${input.company}'`,
    );

    const user = await this.dbConnection.query(
      `select * from ${this.tenant}.users where username = '${input.username}'`,
    );

    const email = await this.dbConnection.query(
      `select * from ${this.tenant}.users where email = '${input.email}'`,
    );

    if (email.rows.length > 0 || user.rows.length > 0) {
      throw new HttpException(
        'Usuário ou Email já cadastrado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (tenant.rows.length > 0) {
      throw new HttpException(
        'Nome da empresa já cadastrada, por favor, escolha um outro nome',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.generateKey(input.email, 'newuser');

    const tenantCreation = {
      name: input.username,
      tenant_name: input.company,
      tenant_img: null,
    };

    let customerId: any;
    try {
      const customers = await this.stripe.customers.list({
        email: input.email,
      });

      if (customers.data.length > 0) {
        throw new HttpException(
          'Email já cadastrado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (customers.data.length === 0) {
        const customer = await this.stripe.customers.create({
          email: input.email,
        });
        customerId = customer.id;
      }
    } catch (e) {
      throw new HttpException(
        'Ocorreu um erro ao realizar seu cadastro, tente novamente.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const newTenant = await this.tenantService.add(tenantCreation);

    if (newTenant.rows.length === 0) {
      throw new HttpException(
        'Ocorreu um erro ao realizar seu cadastro, tente novamente.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await this.tenantService.runMigrations(newTenant.rows[0].tenant_name);
    } catch (e) {
      await this.dbConnection.query(
        `delete from public.tenants where id = '${newTenant.rows[0].id}'`,
      );
      throw new HttpException(
        'Ocorreu um erro ao realizar seu cadastro, tente novamente.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(input.password, saltOrRounds);

    const data = await this.dbConnection.query(
      `insert into public.users (id, username, password, is_admin, tenant_id, name, email, created_at, sid) values ('${uuid()}',
      '${input.username}', '${hash}', 'false', '${newTenant.rows[0].id}', '${
        input.username
      }', '${input.email}'
      , NOW() - interval '3 hour', '${customerId}') returning *`,
    );

    const returnData = {
      id: data.rows[0].id,
      username: data.rows[0].username,
      name: data.rows[0].name,
      email: data.rows[0].email,
      tenant: newTenant.rows[0].tenant_name,
    };

    return returnData;
  }

  async edit(input, token) {
    const tenant = await this.dbConnection.query(
      `select * from public.tenants where name = '${input.tenantName}'`,
    );

    if (tenant.rows.length > 0 && tenant.rows[0].name !== input.tenantName) {
      throw new HttpException(
        'Nome da empresa já cadastrada, por favor, escolha um outro nome',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

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

    const user = await this.dbConnection.query(
      `select * from ${this.tenant}.users where username = '${access.username}'`,
    );

    if (user.rows.length === 0) {
      throw new HttpException(
        'Usuário inválido',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.dbConnection.query(
      `select * from public.tenants where tenant_name = '${access.tenantName}'`,
    );

    await this.dbConnection.query(`drop schema ${access.tenantName} cascade`);

    await this.dbConnection.query(
      `delete from ${this.tenant}.users where id = '${user.rows[0].id}' returning *`,
    );

    const customers = await this.stripe.customers.list({
      email: user.rows[0].email,
    });

    const userStripe = await this.stripe.subscriptions.list({
      customer: customers.data[0].id,
    });

    if (userStripe.data.length > 0) {
      await this.stripe.subscriptions.cancel(userStripe.data[0].id);
    }

    await this.stripe.customers.del(customers.data[0].id);

    return 'User Deletado com Sucesso!';
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

  async generateKey(body: string, type: string) {
    const encryptor = encrypt();
    const aesEncrypted =
      encryptor.update(body, 'utf-8', 'base64') + encryptor.final('base64');
    const encryptedText = Buffer.from(aesEncrypted).toString('base64');

    const formattedDateTime = moment().add(-3, 'hours').format();

    const hash = btoa(formattedDateTime) + '/' + encryptedText;

    if (type === 'newuser') {
      this.emailService.sendEmailWithTemplateNewUser(body, hash);
    }
    if (type === 'password') {
      this.emailService.sendEmailWithTemplatePassword(atob(body), hash);
    }

    return hash;
  }

  async confirmEmail(hash: string) {
    const hashDate = atob(hash.split('/')[0]);
    const encryptedText = hash.split('/')[1];
    const currentDate = moment().add(-3, 'hours').format();

    const differenceInMinutes = moment(currentDate).diff(hashDate, 'minutes');

    if (differenceInMinutes >= 3) {
      throw new HttpException(
        'Chave inválida',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const emailToUpdate = decrypt(encryptedText);

    const email = await this.dbConnection.query(
      `select * from ${this.tenant}.users where email = '${emailToUpdate}'`,
    );

    if (email.rows.length === 0) {
      throw new HttpException(
        'Usuário não encontrado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.dbConnection.query(
      `update ${this.tenant}.users set is_admin = true where email = '${email.rows[0].email}'`,
    );

    return 'Email confirmado com sucesso';
  }

  async recoveryPassword(hash: string, newPassword: string) {
    const hashDate = atob(hash.split('/')[0]); // Assuming hash is defined elsewhere
    const encryptedText = hash.split('/')[1]; // Assuming hash is defined elsewhere
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

    const emailToUpdate = atob(decrypt(encryptedText));

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

    await this.dbConnection.query(
      `update ${this.tenant}.users set password = '${hashPassword}' where email = '${emailToUpdate}'`,
    );

    return 'Senha alterada com sucesso';
  }

  async subscribe(token, key: string) {
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

    const customers = await this.stripe.customers.list({
      email: user.rows[0].email,
    });

    if (customers.data.length === 0) {
      throw new HttpException(
        'Usuário não encontrado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const subscriptionCheck = await this.stripe.subscriptions.list({
      customer: customers.data[0].id,
    });

    const findActiveSubscription = subscriptionCheck.data.find(
      (subscription) => subscription.status === 'active',
    );

    if (findActiveSubscription) {
      throw new HttpException(
        'Usuário já possui assinatura',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.stripe.paymentMethods.attach(key, {
      customer: customers.data[0].id,
    });

    await this.stripe.customers.update(customers.data[0].id, {
      invoice_settings: {
        default_payment_method: key,
      },
    });

    const subscription = await this.stripe.subscriptions.create({
      customer: customers.data[0].id,
      items: [{ price: 'price_1Or7hnBJOR4vvWGRb13MsdaX', quantity: 1 }],
      expand: ['latest_invoice.payment_intent'],
    });

    const endSubscription = new Date(
      subscription.current_period_end * 1000,
    ).toISOString();

    const isoDateString = endSubscription;
    const dateTime = new Date(isoDateString);

    // Formatting date according to PostgreSQL datetime format
    const formattedDateTime = dateTime
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await this.dbConnection.query(
      `update ${this.tenant}.users set is_subscribed = true, subscription_date = '${formattedDateTime}' where id = '${user.rows[0].id}'`,
    );

    return 'Assinatura realizada com sucesso';
  }

  async subscriptionCheck(token) {
    const access = await this.jwtService.decode(token.split(' ')[1]);

    const user = await this.dbConnection.query(
      `select * from ${this.tenant}.users where username = '${access.username}'`,
    );

    const customers = await this.stripe.customers.list({
      email: user.rows[0].email,
    });

    if (customers.data.length === 0) {
      throw new HttpException(
        'Usuário não encontrado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customers.data[0].id,
      type: 'card',
    });

    const lastPaymentMethod =
      paymentMethods.data[paymentMethods.data.length - 1];

    const subscription = await this.stripe.subscriptions.list({
      customer: customers.data[0].id,
    });

    const findActiveSubscription = subscription.data.find(
      (subscription) => subscription.status === 'active',
    );

    const data = {
      lastFour: lastPaymentMethod?.card?.last4 ?? null,
      subscription: findActiveSubscription ? 'active' : 'inactive',
      endSubscription: findActiveSubscription?.current_period_end
        ? new Date(findActiveSubscription?.current_period_end * 1000)
        : null,
    };

    return data;
  }

  async subscriptionCheckLogin(user) {
    const customers = await this.stripe.customers.list({
      email: user.email,
    });

    if (customers.data.length === 0) {
      throw new HttpException(
        'Usuário não encontrado',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const subscription = await this.stripe.subscriptions.list({
      customer: customers.data[0].id,
    });

    const findActiveSubscription = subscription.data.find(
      (subscription) => subscription.status === 'active',
    );

    const canAccessTrial = moment().diff(user.created_at, 'days') < 11;

    if (!findActiveSubscription && !canAccessTrial) {
      await this.dbConnection.query(
        `update ${user.tenant_name}.menus set is_active = false`,
      );
    }
  }

  async unsubscribeOnDb(username) {
    await this.dbConnection.query(
      `update ${this.tenant}.users set is_subscribed = false where username = '${username}'`,
    );
  }
}
