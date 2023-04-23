import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BanInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column()
  banDate: string;

  @Column('varchar', { length: 60 })
  banReason: string;

  @OneToOne(() => User, (user) => user.banInfo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
