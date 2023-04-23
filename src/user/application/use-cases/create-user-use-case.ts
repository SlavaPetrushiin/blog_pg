import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserRepo } from 'src/user/infrastructure/user.repository';
import { Repository } from 'typeorm';

export class CreateUserCommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(protected userRepo: UserRepo) {}

  async execute(command: CreateUserCommand) {
    const { createUserDto } = command;
    const result = await this.userRepo.createUser(createUserDto);
    return result;
  }
}
