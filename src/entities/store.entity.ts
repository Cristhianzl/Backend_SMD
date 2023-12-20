import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('store')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column()
  alternative_id: number;
}
