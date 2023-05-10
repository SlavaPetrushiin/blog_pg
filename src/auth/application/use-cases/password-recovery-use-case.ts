import { UserQueryRepo } from 'src/user/infrastructure/user-query.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmationRepo } from 'src/user/infrastructure/confirmation.repository';
import { BadRequestException } from '@nestjs/common';
import { getArrayErrors } from 'src/utils/getArrayErrors';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { Email } from 'src/email/email.service';
import { UserRepo } from 'src/user/infrastructure/user.repository';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly userQueryRepo: UserQueryRepo,
    private readonly userRepo: UserRepo,
    private readonly emailService: Email,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const { email } = command;

    const user = await this.userQueryRepo.findUserByLoginOrEmail(email);

    if (!user) {
      throw new BadRequestException(
        getArrayErrors('email', 'Пользователя с таким email не существует'),
      );
    }

    if (user.isConfirmed) {
      throw new BadRequestException(
        getArrayErrors('email', 'Email подтвержден'),
      );
    }

    const recoveryCode = uuidv4();
    const dateExpired = add(new Date(), { hours: 1 }).toISOString();
    const isCreatedRecovery =
      await this.userRepo.createOrUpdatePasswordRecovery(
        recoveryCode,
        user.id,
        dateExpired,
      );

    if (!isCreatedRecovery) {
      throw new BadRequestException(
        getArrayErrors('email', 'Не удалось создать код на обновление пароля'),
      );
    }

    const url = this.emailService.getMessageForSendingEmail(
      'password-recovery?recoveryCode',
      recoveryCode,
      'recoveryCode',
    );
    await this.emailService.sendEmail(email, url);

    return isCreatedRecovery;
  }
}
