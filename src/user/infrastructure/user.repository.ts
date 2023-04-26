import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { EmailConfirmation } from '../entities/emailConfirmation.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserBanDto } from '../dto/update-user-ban.dto';

@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User) private readonly userModel: Repository<User>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createUser(dto: CreateUserDto): Promise<number> {
    // const idCreatedUser = await this.dataSource.query(
    //   `
    //     BEGIN;
    //     with new_user as (
    //       INSERT INTO public."user" (login, email, "passwordHash")
    //       VALUES ($1, 'Mira@test.ru', '2343')
    //           RETURNING id
    //     )
    //       INSERT INTO "email_confirmation" (code, expiration_date, "isConfirmed", "userId")
    //         VALUES ('asdasda', '2023-04-22T06:27:50.876Z', false, (select id from new_user));
    //     COMMIT;
    //   `,
    //   [dto.login],
    // );

    //console.log({ idCreatedUser });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [createdUser] = await queryRunner.manager.query(
        `
        INSERT INTO public."user" (login, email, "password_hash")
          VALUES ($1, $2, $3)
          RETURNING *;
      `,
        [dto.login, dto.email, dto.login],
      );

      await queryRunner.manager.query(
        `
          INSERT INTO "email_confirmation" ("user_id", code, expiration_date, "is_confirmed" )
            VALUES ($1, $2, $3, $4);
      `,
        [createdUser.id, 'asdasd', '2023-04-22T06:27:50.876Z', false],
      );

      await queryRunner.manager.query(
        `
          INSERT INTO "ban_info" ("user_id")
            VALUES ($1);
      `,
        [createdUser.id],
      );

      await queryRunner.commitTransaction();
      return createdUser.id;
    } catch (err) {
      console.error(`Don't created user. Error: ${err}`);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async removeUserById(userId: number): Promise<boolean> {
    const [_, isDeleted] = await this.dataSource.query(
      `
        DELETE FROM public."user"
          WHERE id = $1;
    `,
      [userId],
    );

    return isDeleted > 0;
  }

  async updateBanStatusUser(
    userId: number,
    banDto: UpdateUserBanDto,
    ISOdate: string,
  ) {
    const result = await this.dataSource.query(
      `
      with found_user AS (
        SELECT * FROM public."user"
        WHERE id = $1
      ) 
      INSERT INTO public."ban_info" (user_id, is_banned, ban_reason, ban_date) 
        VALUES ((SELECT id FROM found_user), $2, $3, $4 )
          ON CONFLICT (user_id) 
          DO UPDATE SET is_banned = EXCLUDED.is_banned, ban_reason = EXCLUDED.ban_reason, ban_date = EXCLUDED.ban_date
          RETURNING *;
    `,
      [userId, banDto.isBanned, banDto.banReason, ISOdate],
    );

    //row affected

    console.log({ result });
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
