import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { BanInfo } from './banInfo.entity';
import { EmailConfirmation } from './emailConfirmation.entity';
import { Security } from './../../auth/entities/security.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 10 })
  login: string;

  @Column('varchar')
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

  @OneToMany(() => Security, (s) => s.user, {
    cascade: true,
    eager: true,
  })
  security: Security[];
}
