import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserQueryRepo {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findAllUsers() {
    return this.dataSource.query(`
      SELECT * FROM public."user"
    `);
  }
}
