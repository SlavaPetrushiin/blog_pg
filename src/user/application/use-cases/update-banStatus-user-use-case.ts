import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserBanDto } from 'src/user/dto/update-user-ban.dto';
import { UserRepo } from 'src/user/infrastructure/user.repository';

export class UpdateBanStatusUserCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: UpdateUserBanDto,
  ) {}
}

@CommandHandler(UpdateBanStatusUserCommand)
export class UpdateBanStatusUserUseCase
  implements ICommandHandler<UpdateBanStatusUserCommand>
{
  constructor(protected userRepo: UserRepo) {}

  async execute(command: UpdateBanStatusUserCommand) {
    const { userId, dto } = command;
    return await this.userRepo.updateBanStatusUser(
      userId,
      dto,
      new Date().toISOString(),
    );
  }
}
