import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserQueryRepo } from 'src/user/infrastructure/user-query.repository';
import { UserRepo } from 'src/user/infrastructure/user.repository';
import { getArrayErrors } from 'src/utils/getArrayErrors';
import * as bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

const SALT = 10;
export class CreateUserCommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected userRepo: UserRepo,
    protected userQueryRepo: UserQueryRepo,
  ) {}

  async execute(command: CreateUserCommand) {
    const { createUserDto } = command;
    const { email, login, password } = createUserDto;
    const code: string = uuidv4();

    const oldUserByEmail = await this.userQueryRepo.findUserByEmail(email);
    const oldUserByLogin = await this.userQueryRepo.findUserByLogin(login);

    if (oldUserByEmail || oldUserByLogin) {
      throw new BadRequestException(
        getArrayErrors('email', 'Пользователь уже существует'),
      );
    }
    const hashPassword = await bcryptjs.hash(password, SALT);
    const expirationData = add(new Date(), { days: 1 }).toISOString();
    const result = await this.userRepo.createUser({
      code,
      email,
      login,
      hashPassword,
      expirationData,
      isConfirmed: false,
    });
    return result;
  }
}
