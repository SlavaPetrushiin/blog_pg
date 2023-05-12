import { UserQueryRepo } from 'src/user/infrastructure/user-query.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { getArrayErrors } from 'src/utils/getArrayErrors';
import { Email } from 'src/email/email.service';
import { UserRepo } from 'src/user/infrastructure/user.repository';
import * as bcryptjs from 'bcryptjs';
const SALT = 10;

export class PasswordUpdateCommand {
  constructor(
    public readonly newPassword: string,
    public readonly recoveryCode: string,
  ) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(
    private readonly userQueryRepo: UserQueryRepo,
    private readonly userRepo: UserRepo,
    private readonly emailService: Email,
  ) {}

  async execute(command: PasswordUpdateCommand) {
    const { newPassword, recoveryCode } = command;

    const foundUser = await this.userQueryRepo.findUserByRecoveryCode(
      recoveryCode,
    );

    if (!foundUser) {
      getArrayErrors('email', 'Не удалось обновить пароль');
    }
    if (new Date() > new Date(foundUser.expirationDate)) {
      getArrayErrors('email', 'Не удалось обновить пароль');
    }

    const passwordHash = await bcryptjs.hash(newPassword, SALT);

    const isUpdatedPassword = await this.userRepo.updatePassword(
      passwordHash,
      foundUser.userID,
    );

    if (!isUpdatedPassword) {
      getArrayErrors('email', 'Не удалось обновить пароль');
    }

    return isUpdatedPassword;
  }
}
