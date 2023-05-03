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

interface IFindSessionPayload {
  userId: string;
  iat: string;
  deviceId: string;
}

interface IUpdateSessionPayload {
  deviceId: string;
  lastActiveDate: string;
  exp: string;
}

type LogoutPayload = Omit<ILoginPayload, 'ip' | 'title' | 'exp'>;

@Injectable()
export class AuthRepo {
  constructor(
    @InjectRepository(Security)
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  async login(payload: ILoginPayload) {
    const query = `
      INSERT INTO public."security" ("device_id", ip, title, "last_active_date", exp, "user_id")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    const result = await this.dataSource.query(query, [
      payload.deviceId,
      payload.ip,
      payload.title,
      payload.lastActiveDate,
      payload.exp,
      payload.userId,
    ]);

    return result;
  }

  async logout(payload: LogoutPayload): Promise<boolean> {
    const query = ` DELETE FROM public."security" WHERE "device_id" = $1 AND "last_active_date" = $2 AND "user_id" = $3;`;
    const result = await this.dataSource.query(query, [
      payload.deviceId,
      payload.lastActiveDate,
      payload.userId,
    ]);

    return result[1] > 0;
  }

  async findSession(payload: IFindSessionPayload) {
    const query = `
      SELECT * FROM public."security"
        WHERE device_id = $1 AND user_id = $2 AND last_active_date = $3;
    `;

    const result = await this.dataSource.query(query, [
      payload.deviceId,
      payload.userId,
      payload.iat,
    ]);
    return result[0] ?? null;
  }

  async updateSession(payload: IUpdateSessionPayload): Promise<boolean> {
    const query = `
      UPDATE public.security
        SET last_active_date = $1, exp = $2
        WHERE device_id = $3
    `;

    const result = await this.dataSource.query(query, [
      payload.lastActiveDate,
      payload.exp,
      payload.deviceId,
    ]);

    return result[1] > 0;
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
