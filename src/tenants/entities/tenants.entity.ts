import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'tenants' })
export class Tenants {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  tenant_name: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;

  @Column()
  alternativeId: number;

  @Column()
  tenant_img: string;
}
