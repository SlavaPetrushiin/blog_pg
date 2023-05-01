import { AuthRepo } from './../../infrastructure/auth.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { IUserModelWithBanInfo } from 'src/user/entities/models/userModelWithBanInfo';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { convertJwtPayloadSecondsToIsoDate } from 'src/auth/auth.service';

export class SignInCommand {
  constructor(
    public readonly user: IUserModelWithBanInfo,
    public readonly ip: string,
    public readonly title: string,
  ) {}
}

@CommandHandler(SignInCommand)
export class SignInUseCase implements ICommandHandler<SignInCommand> {
  constructor(
    private readonly configService: ConfigService,
    private readonly authRepo: AuthRepo,
  ) {}

  async execute(command: SignInCommand) {
    const { user, ip, title } = command;

    const deviceId = uuidv4();
    const accessToken = jwt.sign(
      { id: user.id, login: user.login },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: this.configService.get('EXPIRES_ACCESS_TIME'),
      },
    );

    const refreshToken = jwt.sign(
      { id: user.id, deviceId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: this.configService.get('EXPIRES_REFRESH_TIME') },
    );

    const decodedRefreshToken: any = jwt.decode(refreshToken);

    const authDeviceSession = await this.authRepo.login({
      ip: ip,
      title,
      lastActiveDate: convertJwtPayloadSecondsToIsoDate(
        decodedRefreshToken.iat!,
      ),
      exp: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.exp!),
      deviceId: deviceId,
      userId: user.id,
    });

    if (!authDeviceSession) {
      return null;
    }

    return { accessToken, refreshToken };
  }
}
