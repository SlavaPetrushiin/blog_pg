import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Security } from '../entities/security.entity';

interface ILoginPayload {
  ip: string;
  title: string;
  lastActiveDate: string;
  exp: string;
  deviceId: string;
  userId: string;
}

@Injectable()
export class AuthRepo {
  constructor(
    @InjectRepository(Security)
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  async login(payload: ILoginPayload) {
    console.log('LOGIN');
    const query = `
      INSERT INTO public."security" ("device_id", ip, title, "last_active_date", exp)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const result = await this.dataSource.query(query, [
      payload.deviceId,
      payload.ip,
      payload.title,
      payload.lastActiveDate,
      payload.exp,
    ]);

    return result;
  }

  // async onModuleInit() {
  //   const usersCount = await this.userModel.count();
  //   log({ usersCount });
  //   const newUser = this.userModel.create();
  //   newUser.login = `login${usersCount + 1}`;
  //   newUser.email = `email${usersCount + 1}`;
  //   newUser.passwordHash = randomUUID();
  //   const emailConfigmation = new EmailConfirmation();
  //   emailConfigmation.code = randomUUID();
  //   emailConfigmation.expirationData = new Date();
  //   emailConfigmation.isConfirmed = false;
  //   newUser.emailConfirmation = emailConfigmation;

  //   await this.userModel.save(newUser);
  //   log(await this.userModel.count());
  // }

  // async create() {}
}
