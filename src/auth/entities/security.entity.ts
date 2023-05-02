import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Security {
  @PrimaryGeneratedColumn('uuid')
  device_id: string;

  @Column('varchar')
  ip: string;

  @Column('varchar')
  title: string;

  @Column('varchar')
  last_active_date: string;

  @Column('varchar')
  exp: string;

  @ManyToOne(() => User, (u) => u.security, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
