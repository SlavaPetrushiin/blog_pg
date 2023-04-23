import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepo } from 'src/user/infrastructure/user.repository';

export class RemoveUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(RemoveUserCommand)
export class RemoveUserUseCase implements ICommandHandler<RemoveUserCommand> {
  constructor(protected userRepo: UserRepo) {}

  async execute(command: RemoveUserCommand) {
    const { userId } = command;
    return await this.userRepo.removeUserById(+userId);
  }
}
