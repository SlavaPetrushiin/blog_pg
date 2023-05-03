import { UserQueryRepo } from './../../user/infrastructure/user-query.repository';
import { RefreshTokenCustomGuard } from './../../guards/refresh-token.guard';
import { RecoveryPasswordDto } from '../dto/recoveryPass.dto';
import { ConfirmationResendingDto } from '../dto/confirmation-resending.dto copy';
import { ConfirmationDto } from '../dto/confirmation.dto';
import { AccessTokenGuard } from '../guards/accessToken.guard';
import { getArrayErrors } from '../../utils/getArrayErrors';
import { AuthService } from '../auth.service';
import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  HttpStatus,
  UseGuards,
  Request,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CreateUserCommand } from 'src/user/application/use-cases/create-user-use-case';
import { SignInCommand } from '../application/use-cases/sign-in-use-case';
import { SignOutCommand } from '../application/use-cases/sign-out-use-case';
import { RegistrationConfirmationCommand } from '../application/use-cases/registration-confirmation-use-case';
import { ConfirmationResendingCommand } from '../application/use-cases/confirmation-resending-use-case';

const MILLISECONDS_IN_HOUR = 3_600_000;
const MAX_AGE_COOKIE_MILLISECONDS = 20 * MILLISECONDS_IN_HOUR; //MILLISECONDS_IN_HOUR * 20 //20_000;

@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private readonly userQueryRepo: UserQueryRepo,
  ) {}

  @SkipThrottle(false)
  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@Request() req) {
    return this.userQueryRepo.findUserById(req.user.id);
  }

  @SkipThrottle(false)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async register(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @SkipThrottle(false)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res() res) {
    const title = req.headers['user-agent'] || '';
    const tokens = await this.commandBus.execute(
      new SignInCommand(req.user, req.ip, title),
    );

    if (!tokens) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: MAX_AGE_COOKIE_MILLISECONDS,
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send({ accessToken: tokens.accessToken });
  }

  @SkipThrottle(false)
  @UseGuards(RefreshTokenCustomGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(@Request() req) {
    const isDeleted = await this.commandBus.execute(
      new SignOutCommand(req.user),
    );

    if (!isDeleted) throw new UnauthorizedException();
    return;
  }

  @SkipThrottle(false)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async confirmationEmail(@Body() confirmationDto: ConfirmationDto) {
    const isConfirm = await this.commandBus.execute(
      new RegistrationConfirmationCommand(confirmationDto),
    );
    if (!isConfirm) {
      throw new BadRequestException(getArrayErrors('code', 'Не валидный код'));
    }

    return;
  }

  @SkipThrottle(false)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async confirmationEmailResending(
    @Body() { email }: ConfirmationResendingDto,
  ) {
    const isUpdated = await this.commandBus.execute(
      new ConfirmationResendingCommand(email),
    );

    if (!isUpdated) {
      throw new BadRequestException(
        getArrayErrors('code', 'Не удалось обовить код'),
      );
    }
    return;
  }

  // @SkipThrottle(false)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Post('password-recovery')
  // async passwordRecovery(
  //   @Body() { email }: ConfirmationResendingDto,
  //   @Res() response: Response,
  // ) {
  //   const result = await this.authService.passwordRecovery(email);
  //   if (!result) {
  //     throw new BadRequestException(
  //       getArrayErrors('code', 'Не удалось создать код на обновление пароля'),
  //     );
  //   }

  //   response.status(HttpStatus.NO_CONTENT).send();
  // }

  // @SkipThrottle(false)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @Post('new-password')
  // async updatePassword(
  //   @Body() recoveryPasswordDto: RecoveryPasswordDto,
  //   @Res() response: Response,
  // ) {
  //   const { newPassword, recoveryCode } = recoveryPasswordDto;
  //   const result = await this.authService.updatePassword(
  //     newPassword,
  //     recoveryCode,
  //   );
  //   if (!result) {
  //     throw new BadRequestException(
  //       getArrayErrors('code', 'Не удалось создать код на обновление пароля'),
  //     );
  //   }

  //   response.status(HttpStatus.NO_CONTENT).send();
  // }

  // @SkipThrottle(false)
  // @HttpCode(HttpStatus.UNAUTHORIZED)
  // //@UseGuards(RefreshTokenGuard)
  // @UseGuards(RefreshTokenCustomGuard)
  // @Post('refresh-token')
  // async refreshToken(@Request() req, @Res() res) {
  //   const user = req.user;
  //   const tokens = await this.authService.updateRefreshToken(user);

  //   if (!tokens) {
  //     throw new UnauthorizedException();
  //   }

  //   res.cookie('refreshToken', tokens.refreshToken, {
  //     maxAge: MAX_AGE_COOKIE_MILLISECONDS,
  //     httpOnly: true,
  //     secure: true,
  //   });
  //   return res.status(200).send({ accessToken: tokens.accessToken });
  // }
}
