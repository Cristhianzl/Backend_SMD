import { BaseDto } from 'src/shared/base.dto';

import { PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export class GetFeedbackDto extends BaseDto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  menu_name: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'boolean', nullable: true })
  recommend: boolean;

  @Column({ type: 'integer', nullable: true })
  liked_menu: number;

  @Column({ type: 'integer', nullable: true })
  liked_service: number;

  @Column({ type: 'varchar', nullable: true })
  feedback_msg: string;

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date;

  @Column({
    type: 'int',
  })
  alternative_id: number;
}
