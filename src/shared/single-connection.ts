import { DataSource } from 'typeorm';

export class SingleConnection {
  private static instances: Map<
    string,
    { connection: DataSource; openedAt: Date }
  > = new Map();

  public static async getInstance(
    tenantId: string,
    schema: string,
  ): Promise<DataSource> {
    const instance = SingleConnection.instances.get(tenantId);
    if (instance && instance?.connection) return instance.connection;

    const dataSource = new DataSource({
      schema: schema,
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: 'postgres',
      password: 'password',
      database: 'menudigital',
      synchronize: false,
      entities: [__dirname + '/../**/*.entity.{js,ts}'],
      logging: true,
    });
    const connection = await dataSource.initialize();
    SingleConnection.instances.set(tenantId, {
      connection,
      openedAt: new Date(),
    });
    return connection;
  }
}
