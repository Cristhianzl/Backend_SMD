import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';

@Injectable()
export class DiscountsService {
  tenant: string;
  constructor(
    @InjectConnection('dbConnection')
    private dbConnection: Client,
  ) {}

  setTenant(tenant: string) {
    this.tenant = tenant;
  }

  async listAll() {
    return await this.dbConnection.query(
      `select * from ${this.tenant}.discounts`,
    );
  }
}
