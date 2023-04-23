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
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 10 })
  login: string;

  @Column()
  email: string;

  @Column('varchar', { length: 60 })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => BanInfo, (banInfo) => banInfo.user, {
    cascade: true,
    eager: true,
  })
  banInfo: BanInfo;

  @OneToOne(
    () => EmailConfirmation,
    (emailConfirmation) => emailConfirmation.user,
    {
      cascade: true,
      eager: true,
    },
  )
  emailConfirmation: EmailConfirmation;
}
