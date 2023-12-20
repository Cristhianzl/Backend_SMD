import { IsNumber, IsUUID } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'int',
  })
  @IsNumber()
  alternative_id: number;

  @Column({
    type: 'boolean',
    nullable: false,
  })
  is_admin: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @OneToOne(() => Tenant, (tnt) => tnt.id)
  @JoinColumn([{ name: 'tenant_id', referencedColumnName: 'id' }])
  tenant_id: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  email: string;
}
