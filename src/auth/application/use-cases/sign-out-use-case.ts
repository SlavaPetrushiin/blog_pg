import { AuthRepo } from '../../infrastructure/auth.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenJwtPayloadDto } from 'src/auth/dto/refresh-token-jwt-payload.dto';

export class SignOutCommand {
  constructor(public readonly jwtPayload: RefreshTokenJwtPayloadDto) {}
}

@CommandHandler(SignOutCommand)
export class SignOutUseCase implements ICommandHandler<SignOutCommand> {
  constructor(
    private readonly configService: ConfigService,
    private readonly authRepo: AuthRepo,
  ) {}

  async execute(command: SignOutCommand) {
    const { jwtPayload } = command;
    const { id, deviceId, iat } = jwtPayload;
    const lastActiveDate = new Date(iat * 1000).toISOString();

    return this.authRepo.logout({ userId: id, deviceId, lastActiveDate });
  }
}
