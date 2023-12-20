import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from 'src/entities/discount.entity';

@Injectable()
export class DiscountsService {
  tenant: string;
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  setTenant(tenant: string) {
    this.tenant = tenant;
  }

  async listAll() {
    return await this.discountRepository.query(
      `select * from ${this.tenant}.discounts`,
    );
  }
}
