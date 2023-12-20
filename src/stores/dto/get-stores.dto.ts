import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('stores')
export class Stores {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'int',
  })
  alternative_id: number;
}
