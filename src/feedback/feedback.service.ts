import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Client } from 'pg';
import { InjectConnection } from 'nest-postgres';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class FeedbackService {
  tenant: string;

  constructor(
    @InjectConnection('dbConnection')
    private dbConnection: Client,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  setTenant(tenant: string) {
    this.tenant = tenant;
  }

  async listAll() {
    const data = await this.dbConnection.query(
      `select * from ${this.tenant}.feedbacks order by created_at desc`,
    );
    const countData = await this.dbConnection.query(
      `select count(*) from ${this.tenant}.feedbacks `,
    );

    const count = Number(countData?.rows[0]?.count ?? 0);

    return {
      data,
      count,
    };
  }

  async find(id: string) {
    return await this.dbConnection.query(
      `select * from ${this.tenant}.feedbacks where id = '${id}'`,
    );
  }

  async add(input) {
    let values: string = '';
    let columns: string = '';
    const uuidValue = uuid();

    if (input.name != null) {
      values = values + `'${input.name}',`;
      columns = columns + 'name,';
    }

    if (input.email != null) {
      values = values + `'${input.email}',`;
      columns = columns + 'email,';
    }
    if (input.phone != null) {
      values = values + `'${input.phone}',`;
      columns = columns + 'phone,';
    }

    if (input.recommend != null) {
      values = values + `'${input.recommend}',`;
      columns = columns + 'recommend,';
    }

    if (input.likeMenu != null) {
      values = values + `'${input.likeMenu}',`;
      columns = columns + 'liked_menu,';
    }

    if (input.likeService != null) {
      values = values + `'${input.likeService}',`;
      columns = columns + 'liked_service,';
    }

    if (input.feedbackMessage != null) {
      values = values + `'${input.feedbackMessage}',`;
      columns = columns + 'feedback_msg,';
    }

    if (input.menuName != null) {
      values = values + `'${input.menuName}',`;
      columns = columns + 'menu_name,';
    }

    try {
      const data = await this.dbConnection.query(
        `insert into ${this.tenant}.feedbacks (id, ${columns} created_at) values ('${uuidValue}',${values} NOW() - interval '3 hour') returning *`,
      );

      return data;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async findWithFilter(filters: any, page: number, pagesize: number) {
    let filtersQuery: string = '';
    let queryCount: string = '';

    const query = `select * from ${
      this.tenant
    }.feedbacks where 1=1 ${filtersQuery} 
    group by id, created_at order by created_at desc limit ${pagesize} offset ${
      page * pagesize
    }`;

    queryCount = `select count(*) from ${this.tenant}.feedbacks where 1=1 ${
      Object.keys(filters).length ? filtersQuery : ''
    }`;

    const recommendations = `
    select sum(liked_menu) as sum_liked_menu, sum(liked_service) as sum_liked_service,
    count(recommend) as count_recommend, count(liked_menu) as count_liked_menu,
    count(liked_service) as count_liked_service,
    count(feedback_msg) as count_feedback_msg
    from ${this.tenant}.feedbacks where 1=1
    `;

    const favoriteMenu = `
    SELECT menu_name, AVG(liked_menu) as average_note
    FROM ${this.tenant}.feedbacks
    GROUP BY menu_name
    ORDER BY average_note DESC
    LIMIT 1;
    `;

    const data = await this.dbConnection.query(query);
    const countData = await this.dbConnection.query(queryCount);

    const cacheKey = 'avaliacoes-' + this.tenant;
    const value = await this.cacheManager.get(cacheKey);

    let dataRecommendations = {};

    if (value) {
      dataRecommendations = value;
    } else {
      const recommendationsData =
        await this.dbConnection.query(recommendations);
      dataRecommendations = recommendationsData?.rows[0];

      const favoriteMenuData = await this.dbConnection.query(favoriteMenu);

      dataRecommendations = {
        ...dataRecommendations,
        favoriteMenu: favoriteMenuData?.rows[0],
      };

      await this.cacheManager.set(cacheKey, dataRecommendations);
    }

    const count = Number(countData?.rows[0].count ?? 0);

    return {
      data,
      count,
      dataRecommendations,
    };
  }
}
