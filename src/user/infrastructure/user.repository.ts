import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserBanDto } from '../dto/update-user-ban.dto';

type EmailConfirmationModel = {
  code: string;
  isConfirmed: boolean;
  expirationData: string;
};

type NewUserModel<T> = {
  [P in keyof T as P extends 'password' ? `hash${Capitalize<P>}` : P]: T[P];
} & EmailConfirmationModel;

@Injectable()
export class UserRepo {
  constructor(
    @InjectRepository(User) private readonly userModel: Repository<User>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createUser(newUser: NewUserModel<CreateUserDto>): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const queryUser = `
        INSERT INTO public."user" (login, email, "password_hash")
          VALUES ($1, $2, $3)
          RETURNING *;
      `;
      const queryEmailConfirm = `INSERT INTO "email_confirmation" ("user_id", code, "expiration_date", "is_confirmed" ) VALUES ($1, $2, $3, $4);`;
      const queryBunInfo = `INSERT INTO "ban_info" ("user_id") VALUES ($1);`;

      const [createdUser] = await queryRunner.manager.query(queryUser, [
        newUser.login,
        newUser.email,
        newUser.hashPassword,
      ]);

      await queryRunner.manager.query(queryEmailConfirm, [
        createdUser.id,
        newUser.code,
        newUser.expirationData,
        newUser.isConfirmed,
      ]);

      await queryRunner.manager.query(queryBunInfo, [createdUser.id]);

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
    userId: string,
    banDto: UpdateUserBanDto,
    ISOdate: string,
  ) {
    const query = `
        UPDATE public."ban_info" SET is_banned = $2, ban_reason = $3, ban_date = $4
          WHERE user_id = $1
      `;

    const result = await this.dataSource.query(query, [
      userId,
      banDto.isBanned,
      banDto.banReason,
      ISOdate,
    ]);
    return result[1] > 0;
  }

  async createOrUpdatePasswordRecovery(
    recoveryCode: string,
    userId: string,
    dateExpired: string,
  ): Promise<boolean> {
    const query = `
      INSERT INTO public."password_recovery"  ("recovery_code", "expiration_date", "user_id")
        VALUES($1, $2, $3) 
        ON CONFLICT ("user_id") 
        DO 
        UPDATE SET "recovery_code" = EXCLUDED.recovery_code, "expiration_date" = EXCLUDED.expiration_date, "user_id" = EXCLUDED.user_id
        RETURNING *;
    `;

    const result = await this.dataSource.query(query, [
      recoveryCode,
      dateExpired,
      userId,
    ]);

    return !!result[0];
  }

  async updatePassword(password: string, userID: string): Promise<boolean> {
    const query = `
      UPDATE public."user" SET "password_hash" = $1
        WHERE id = $2
    `;

    const result = await this.dataSource.query(query, [password, userID]);

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
