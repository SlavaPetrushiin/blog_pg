import { UserQueryRepo } from 'src/user/infrastructure/user-query.repository';
import { RefreshTokenJwtPayloadDto } from './../auth/dto/refresh-token-jwt-payload.dto';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RefreshTokenCustomGuard implements CanActivate {
  constructor(private readonly userQueryRepo: UserQueryRepo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const refreshToken = request.cookies.refreshToken;
      if (!refreshToken) throw new UnauthorizedException();

      const jwtPayload = (await jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
      )) as RefreshTokenJwtPayloadDto;
      if (!jwtPayload) throw new UnauthorizedException();

      const user = await this.userQueryRepo.findUserById(jwtPayload.id);
      if (!user) throw new UnauthorizedException();
      request.user = jwtPayload;

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
