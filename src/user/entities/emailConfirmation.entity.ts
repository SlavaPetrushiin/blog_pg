import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ name: 'expiration_date' })
  expirationData: string;

  @Column()
  isConfirmed: boolean;

  @OneToOne(() => User, (user) => user.emailConfirmation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
