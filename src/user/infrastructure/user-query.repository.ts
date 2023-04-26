import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AllEntitiesUser } from '../dto/allEntitiesUser.dto';

@Injectable()
export class UserQueryRepo {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findUserById(userId: string) {
    const [foundUser] = await this.dataSource.query(
      `
        SELECT 
          u.id, 
          u.email,
          u.login, 
          u.password_hash,
          u.created_at,
          e.code,
          e.expiration_date,
          e.is_confirmed,
          b.ban_date,
          b.ban_reason,
          b.is_banned
      FROM public."user" as u
        LEFT JOIN public."email_confirmation" AS e ON e.user_id  = u.id
        LEFT JOIN public."ban_info" AS b ON b.user_id = u.id 
        WHERE u.id = $1;
    `,
      [userId],
    );

    console.log(foundUser);

    if (!foundUser) {
      return null;
    }

    return foundUser;
  }

  async findAllUsers(query: AllEntitiesUser) {
    const {
      pageNumber,
      pageSize,
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
      banStatus,
    } = query;

    const foundUsers = await this.dataSource.query(`
        SELECT 
        u.id, 
        u.login,
        u.email,
        u.created_at,
        b.ban_date,
        b.ban_reason,
        b.is_banned
      FROM public."user" as u
      LEFT JOIN public."ban_info" AS b ON b.user_id = u.id 
    `);

    return foundUsers.map((user) => ({
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.is_banned,
        banDate: user.ban_date,
        banReason: user.ban_reason,
      },
    }));
  }
}
