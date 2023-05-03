import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IConfirmDBModel } from '../entities/models/confirmModel';

@Injectable()
export class ConfirmationRepo {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findEmailConfirmationByCode(code: string): Promise<IConfirmDBModel> {
    const query = `SELECT 
      id, code, expiration_date as "expirationDate", is_confirmed as "isConfirmed", user_id as "userId"
    FROM public."email_confirmation" WHERE code = $1; `;

    const result = await this.dataSource.query(query, [code]);
    return result[0] ?? null;
  }

  async updateConfirmationStatus(
    code: string,
    userId: string,
  ): Promise<IConfirmDBModel> {
    const query = `UPDATE public."email_confirmation"
      SET is_confirmed = true
      WHERE confirmation_code = $1 AND user_id = $2; 
    `;

    const result = await this.dataSource.query(query, [code, userId]);
    return result[0] ?? null;
  }
}
