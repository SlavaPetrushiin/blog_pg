import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';
import { BanInfo } from './banInfo.entity';
import { EmailConfirmation } from './emailConfirmation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 10 })
  login: string;

  @Column()
  email: string;

  @Column('varchar', { length: 60 })
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToOne(() => BanInfo, (banInfo) => banInfo.user, {
    cascade: true,
    eager: true,
  })
  ban_info: BanInfo;

  @OneToOne(
    () => EmailConfirmation,
    (emailConfirmation) => emailConfirmation.user,
    {
      cascade: true,
      eager: true,
    },
  )
  email_confirmation: EmailConfirmation;
}
