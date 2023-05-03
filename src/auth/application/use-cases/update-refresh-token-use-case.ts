import { AuthRepo } from '../../infrastructure/auth.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { convertJwtPayloadSecondsToIsoDate } from 'src/auth/auth.service';
import { RefreshTokenJwtPayloadDto } from 'src/auth/dto/refresh-token-jwt-payload.dto';

export class UpdateRefreshTokenCommand {
  constructor(public readonly user: RefreshTokenJwtPayloadDto) {}
}

@CommandHandler(UpdateRefreshTokenCommand)
export class UpdateRefreshTokenUseCase
  implements ICommandHandler<UpdateRefreshTokenCommand>
{
  constructor(
    private readonly configService: ConfigService,
    private readonly authRepo: AuthRepo,
  ) {}

  async execute({ user }: UpdateRefreshTokenCommand) {
    const { id, iat, deviceId } = user;
    const foundedSession = await this.authRepo.findSession({
      iat: convertJwtPayloadSecondsToIsoDate(iat),
      userId: id,
      deviceId,
    });

    if (!foundedSession) {
      return null;
    }

    const accessToken = jwt.sign(
      { id, deviceId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: this.configService.get('EXPIRES_ACCESS_TIME') },
    );
    const refreshToken = jwt.sign(
      { id, deviceId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: this.configService.get('EXPIRES_REFRESH_TIME') },
    );

    const decodedRefreshToken: any = jwt.decode(refreshToken);

    const result = await this.authRepo.updateSession({
      deviceId,
      lastActiveDate: convertJwtPayloadSecondsToIsoDate(
        decodedRefreshToken.iat,
      ),
      exp: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.exp),
    });

    if (!result) {
      return null;
    }

    return { accessToken, refreshToken };
  }
}
