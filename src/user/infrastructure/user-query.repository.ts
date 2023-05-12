import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AllEntitiesUser } from '../dto/allEntitiesUser.dto';
import { IUserDBModel } from '../entities/models/userModel';
import { BanStatuses } from '../types/types';
import { IUserModelWithBanInfo } from '../entities/models/userModelWithBanInfo';
import { IUserModelWithRecoveryCode } from '../entities/models/userModelWithRecoveryCode';

@Injectable()
export class UserQueryRepo {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  private _userFilter(query: AllEntitiesUser): string {
    const { searchEmailTerm, searchLoginTerm } = query;
    const filterLogin = `login LIKE '%${searchLoginTerm}%'`;
    const filterEmail = `email LIKE '%${searchEmailTerm}%'`;

    if (searchLoginTerm.length > 0 && searchEmailTerm.length > 0) {
      return `${filterLogin} OR ${filterEmail}`;
    }
    if (searchLoginTerm.length > 0) return filterLogin;
    if (searchEmailTerm.length > 0) return filterEmail;
    return '';
  }

  private _banFilter(query: AllEntitiesUser): string {
    const { banStatus } = query;
    if (banStatus === BanStatuses.banned) {
      return `b.ban_status = true`;
    }
    if (banStatus === BanStatuses.notBanned) {
      return `b.ban_status = false`;
    }
    return '';
  }

  private _getFilter(query: AllEntitiesUser): string {
    const banFilter = this._banFilter(query);
    const userFilter = this._userFilter(query);

    if (banFilter.length > 0 && userFilter.length > 0) {
      return `${banFilter} AND ${userFilter}`;
    }
    if (banFilter.length > 0) {
      return `${banFilter}`;
    }
    if (userFilter.length > 0) {
      return `${userFilter}`;
    }
    return '';
  }

  async findUserById(userId: string): Promise<IUserDBModel> {
    const query = `
      SELECT id, login, email, password_hash as "passwordHash", created_at as "createdAt"
        FROM public."user"
        WHERE id = $1;
    `;

    const result = await this.dataSource.query(query, [userId]);
    return result[0] ?? null;
  }

  async findUserByLogin(login: string): Promise<IUserDBModel> {
    const query = `
      SELECT id, login, email, password_hash as "passwordHash", created_at as "createdAt"
        FROM public."user"
        WHERE login = $1;
    `;

    const result = await this.dataSource.query(query, [login]);
    return result[0] ?? null;
  }

  async findUserByEmail(email: string): Promise<IUserDBModel> {
    const query = `
      SELECT id, login, email, password_hash as "passwordHash", created_at as "createdAt"
        FROM public."user"
        WHERE email = $1;
    `;

    const result = await this.dataSource.query(query, [email]);
    return result[0] ?? null;
  }

  async findUserByLoginOrEmail(
    emailOrLogin: string,
  ): Promise<IUserModelWithBanInfo> {
    const query = `
      SELECT 
      u.id, 
      u.login,
      u.email,
      u.password_hash as "passwordHash",
      u.created_at as "createdAt",
      COALESCE(b.ban_date, '') as "banDate",
      COALESCE(b.ban_reason, '') as "banReason",
      b.is_banned as "isBanned",
      e.code,
      e.expiration_date as "expirationDate",
      e.is_confirmed as "isConfirmed"
      FROM public."user" as u
      LEFT JOIN public."ban_info" AS b ON b.user_id = u.id
      LEFT JOIN public."email_confirmation" AS e ON e.user_id = u.id
      WHERE u.login = $1 OR u.email = $1;
    `;

    const result = await this.dataSource.query(query, [emailOrLogin]);
    return result[0] ?? null;
  }

  async findAllUsers(query: AllEntitiesUser) {
    const filter = this._getFilter(query);
    const skip = (Number(query.pageNumber) - 1) * Number(query.pageSize);

    let stdQuery = `
                SELECT 
                  u.id, 
                  u.login,
                  u.email,
                  u.created_at as "createdAt",
                  COALESCE(b.ban_date, '') as "banDate",
                  COALESCE(b.ban_reason, '') as "banReason",
                  b.is_banned as "isBanned"
                  FROM public."user" as u
                  LEFT JOIN public."ban_info" AS b ON b.user_id = u.id
                `;

    if (filter.length > 0) {
      stdQuery += `WHERE ${filter} `;
    }

    stdQuery += `ORDER BY ${query.sortBy} ${query.sortDirection} `;
    stdQuery += `LIMIT $1 OFFSET ${skip};`;

    const foundUsers = await this.dataSource.query(stdQuery, [query.pageSize]);

    return foundUsers.map((user) => ({
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    }));
  }

  async findUserByRecoveryCode(
    emailOrLogin: string,
  ): Promise<IUserModelWithRecoveryCode> {
    const query = `
      SELECT p."recovery_code" AS "recoveryCode", p."expiration_date" as "expirationDate", p."user_id" AS "userID", u.login, u.email FROM public."password_recovery" AS p
      JOIN public."user" AS u ON u.id = p."user_id"
      WHERE p.recovery_code = $1;  
    `;

    const result = await this.dataSource.query(query, [emailOrLogin]);
    return result[0] ?? null;
  }
}
