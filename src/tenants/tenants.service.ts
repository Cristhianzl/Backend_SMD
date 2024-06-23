import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTenantName } from 'src/shared/create-tenant-name';
import { v4 as uuid } from 'uuid';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
@Injectable()
export class TenantsService {
  tenant: string;

  constructor(
    @InjectConnection('dbConnection')
    private dbConnection: Client,
    private jwtService: JwtService,
  ) {
    this.setTenant('public');
  }

  setTenant(tenant: string) {
    this.tenant = 'public' ?? tenant;
  }

  async listAll() {
    const data = await this.dbConnection.query(
      `select * from ${this.tenant}.tenants order by created_at desc`,
    );
    const countData = await this.dbConnection.query(
      `select count(*) from ${this.tenant}.tenants `,
    );

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.dbConnection.query(
      `select * from ${this.tenant}.tenants where id = '${id}'`,
    );
  }

  async findByName(token: string) {
    const access = await this.jwtService.decode(token.split(' ')[1]);

    const data = await this.dbConnection.query(
      `select * from public.tenants where tenant_name = '${access.tenantName}'`,
    );

    return data?.rows[0];
  }

  async findWithFilter(filters: any, page: number, pagesize: number) {
    let filtersQuery: string = '';
    let queryCount: string = '';

    if (filters?.name) {
      filtersQuery = filtersQuery + ` and name like '%${filters.name}%' `;
    }

    const query = `select * from ${
      this.tenant
    }.tenants where 1=1 ${filtersQuery} 
        group by created_at, id, name order by created_at desc limit ${pagesize} offset ${
          page * pagesize
        }`;

    queryCount = `select count(*) from ${this.tenant}.tenants where 1=1 ${
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
      }.tenants (id, name, tenant_name, tenant_img, created_at, primary_color, secondary_color, tertiary_color, quaternary_color, quinary_color) values ('${uuid()}', '${
        input.tenant_name
      }', '${createTenantName(input.tenant_name)}', '${
        input.tenant_img
      }', NOW() - interval '3 hour', '#111827', '#ffffff', '#29304c', '#f59e0b', '#b4530c') returning *`,
    );

    return data;
  }

  async edit(input) {
    const tenant = await this.dbConnection.query(
      `select * from public.tenants where name = '${input.name}'`,
    );

    if (tenant.rows.length > 0) {
      throw new HttpException(
        'Nome da empresa já cadastrada, por favor, escolha um outro nome.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const tenantIdQuery = await this.dbConnection.query(
      `select id from public.tenants where tenant_name = '${input.tenant_name}'`,
    );

    const tenantId = input.id ?? tenantIdQuery.rows[0].id;
    let values: string = '';

    if (input.name != null) {
      values = values + `name = '${input.name}',`;
    }

    if (input.tenant_img != null) {
      values = values + `tenant_img = '${input.tenant_img}',`;
    }

    if (input.primary_color != null) {
      values = values + `primary_color = '${input.primary_color}',`;
    }

    if (input.secondary_color != null) {
      values = values + `secondary_color = '${input.secondary_color}',`;
    }

    if (input.tertiary_color != null) {
      values = values + `tertiary_color = '${input.tertiary_color}',`;
    }

    if (input.quaternary_color != null) {
      values = values + `quaternary_color = '${input.quaternary_color}',`;
    }

    if (input.quinary_color != null) {
      values = values + `quinary_color = '${input.quinary_color}',`;
    }

    const data = await this.dbConnection.query(
      `update ${this.tenant}.tenants set ${values}
      updated_at = NOW() - interval '3 hour'
      where id = '${tenantId}' returning *`,
    );

    return data[0];
  }

  async remove(id: string) {
    const data = await this.dbConnection.query(
      `delete from ${this.tenant}.tenants where id = '${id}' returning *`,
    );

    return data;
  }

  async runMigrations(schemaName) {
    const data = await this.dbConnection.query(
      `
      -- This script was generated by the ERD tool in pgAdmin 4.
-- Please log an issue at https://github.com/pgadmin-org/pgadmin4/issues/new/choose if you find any bugs, including reproduction steps.
BEGIN;


CREATE SCHEMA IF NOT EXISTS ${schemaName};


CREATE TABLE IF NOT EXISTS ${schemaName}.categories
(
  id uuid NOT NULL,
  name character varying COLLATE pg_catalog."default" NOT NULL,
  url_img character varying COLLATE pg_catalog."default",
  created_at timestamp without time zone NOT NULL,
  alternative_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS ${schemaName}.category_products
(
  id uuid,
  alternative_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  product_id uuid,
  category_id uuid,
  order_view integer
);

CREATE TABLE IF NOT EXISTS ${schemaName}.menu_categories
(
  id uuid,
  alternative_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  menu_id uuid,
  category_id uuid,
  order_view integer
);

CREATE TABLE IF NOT EXISTS ${schemaName}.menus
(
  id uuid NOT NULL,
  alternative_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  name character varying COLLATE pg_catalog."default",
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone,
  is_active boolean DEFAULT false,
  CONSTRAINT menu_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS ${schemaName}.products
(
  id uuid NOT NULL,
  name character varying COLLATE pg_catalog."default" NOT NULL,
  discount_value integer,
  price numeric NOT NULL,
  on_sale boolean NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone,
  alternative_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  discount_type character varying COLLATE pg_catalog."default",
  url_img character varying COLLATE pg_catalog."default",
  description character varying COLLATE pg_catalog."default",
  is_gluten_free boolean,
  is_vegan boolean,
  is_vegetarian boolean,
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.tenants
(
  id uuid NOT NULL,
  name character varying COLLATE pg_catalog."default" NOT NULL,
  tenant_name character varying COLLATE pg_catalog."default" NOT NULL,
  created_at timestamp without time zone NOT NULL,
  deleted_at timestamp without time zone,
  updated_at timestamp without time zone,
  alternative_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  tenant_img character varying COLLATE pg_catalog."default",
  primary_color character varying COLLATE pg_catalog."default" DEFAULT '#111827',
  secondary_color character varying COLLATE pg_catalog."default" DEFAULT '#ffffff',
  tertiary_color character varying COLLATE pg_catalog."default" DEFAULT '#29304c',
  quaternary_color character varying COLLATE pg_catalog."default" DEFAULT '#f59e0b',
  quinary_color character varying COLLATE pg_catalog."default" DEFAULT '#b4530c',
  CONSTRAINT tenants_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.users
(
  id uuid NOT NULL,
  username character varying COLLATE pg_catalog."default" NOT NULL,
  password character varying COLLATE pg_catalog."default" NOT NULL,
  is_admin boolean NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone,
  alternative_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
  tenant_id uuid NOT NULL,
  name character varying COLLATE pg_catalog."default" NOT NULL,
  email character varying COLLATE pg_catalog."default",
  is_subscribed boolean,
  subscription_date timestamp without time zone,
  sid character varying COLLATE pg_catalog."default",
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS ${schemaName}.feedbacks
(
  id uuid NOT NULL PRIMARY KEY,
  name character varying NULL,
  menu_name character varying NULL,
  email character varying NULL,
  phone character varying NULL,
  recommend boolean NULL,
  liked_menu integer NULL,
  liked_service integer NULL,
  feedback_msg character varying NULL,
  created_at timestamp without time zone NOT NULL,
  alternative_id integer NOT NULL GENERATED ALWAYS AS IDENTITY (INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1)
);


END;
      `,
    );

    return data;
  }

  async runMigrationsDB() {
    const getAllSchemas = await this.dbConnection.query(
      `select schema_name from information_schema.schemata where schema_name not in ('information_schema', 'pg_catalog', 'public')`,
    );
    for (const schema of getAllSchemas.rows) {
      await this.runMigrations(schema.schema_name);
    }
  }
}
