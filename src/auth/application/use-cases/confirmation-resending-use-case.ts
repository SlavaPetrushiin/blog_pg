import { UserQueryRepo } from 'src/user/infrastructure/user-query.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmationRepo } from 'src/user/infrastructure/confirmation.repository';
import { BadRequestException } from '@nestjs/common';
import { getArrayErrors } from 'src/utils/getArrayErrors';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { Email } from 'src/email/email.service';

export class ConfirmationResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ConfirmationResendingCommand)
export class ConfirmationResendingUseCase
  implements ICommandHandler<ConfirmationResendingCommand>
{
  constructor(
    private readonly userQueryRepo: UserQueryRepo,
    private readonly confirmationRepo: ConfirmationRepo,
    private readonly emailService: Email,
  ) {}

  async execute(command: ConfirmationResendingCommand) {
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

    const newCode: string = uuidv4();
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    }).toISOString();

    const updatedClient = await this.confirmationRepo.updateConfirmationCode({
      userId: user.id,
      code: newCode,
      expirationDate,
    });

    if (!updatedClient) {
      throw new BadRequestException(
        getArrayErrors('code', 'Не удалось обновить код'),
      );
    }

    const url = this.emailService.getMessageForSendingEmail(
      'confirm-registration?code',
      newCode,
      'registration',
    );
    await this.emailService.sendEmail(user.email, url);

    return updatedClient;
  }
}
