import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('discount')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  symbol: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column()
  alternative_id: number;
}
