import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('discounts')
export class Discounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  symbol: string;

  @Column({
    type: 'int',
  })
  alternative_id: number;
}
