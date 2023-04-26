import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BanInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean', default: false })
  is_banned: boolean;

  @Column({ nullable: true, default: null })
  ban_date: string;

  @Column('varchar', { length: 60, nullable: true, default: null })
  ban_reason: string;

  @OneToOne(() => User, (user) => user.ban_info, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
