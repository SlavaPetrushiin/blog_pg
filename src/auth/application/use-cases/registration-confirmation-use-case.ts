import { AuthRepo } from '../../infrastructure/auth.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ConfirmationDto } from 'src/auth/dto/confirmation.dto';
import { ConfirmationRepo } from 'src/user/infrastructure/confirmation.repository';
import { BadRequestException } from '@nestjs/common';
import { getArrayErrors } from 'src/utils/getArrayErrors';

export class RegistrationConfirmationCommand {
  constructor(public readonly confirmationDto: ConfirmationDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private readonly configService: ConfigService,
    private readonly authRepo: AuthRepo,
    private readonly confirmationRepo: ConfirmationRepo,
  ) {}

  async execute(command: RegistrationConfirmationCommand) {
    const {
      confirmationDto: { code },
    } = command;

    const confirmInfo = await this.confirmationRepo.findEmailConfirmationByCode(
      code,
    );

    if (!confirmInfo) {
      return null;
    }
    if (confirmInfo.code != code) {
      return null;
    }
    if (confirmInfo.isConfirmed) {
      throw new BadRequestException(
        getArrayErrors('code', 'Email подтвержден'),
      );
    }

    if (new Date() > new Date(confirmInfo.expirationDate)) {
      return null;
    }

    const isUpdateConfirm =
      await this.confirmationRepo.updateConfirmationStatus(
        confirmInfo.code,
        confirmInfo.userId,
      );

    if (!isUpdateConfirm) {
      return null;
    }

    return isUpdateConfirm;
  }
}
