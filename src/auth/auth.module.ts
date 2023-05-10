import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { User } from 'src/user/entities/user.entity';
import { UserQueryRepo } from 'src/user/infrastructure/user-query.repository';
import { Security } from './entities/security.entity';
import { AuthRepo } from './infrastructure/auth.repository';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthService } from './auth.service';
import { SignInUseCase } from './application/use-cases/sign-in-use-case';
import { JwtModule } from '@nestjs/jwt';
import { SignOutUseCase } from './application/use-cases/sign-out-use-case';
import { RegistrationConfirmationUseCase } from './application/use-cases/registration-confirmation-use-case';
import { ConfirmationRepo } from 'src/user/infrastructure/confirmation.repository';
import { ConfirmationResendingUseCase } from './application/use-cases/confirmation-resending-use-case';
import { Email } from 'src/email/email.service';
import { UpdateRefreshTokenUseCase } from './application/use-cases/update-refresh-token-use-case';
import { PasswordRecoveryUseCase } from './application/use-cases/password-recovery-use-case';
import { UserRepo } from 'src/user/infrastructure/user.repository';

const useCases = [
  SignInUseCase,
  SignOutUseCase,
  RegistrationConfirmationUseCase,
  ConfirmationResendingUseCase,
  UpdateRefreshTokenUseCase,
  PasswordRecoveryUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Security]),
    CqrsModule,
    JwtModule.register({}),
  ],
  providers: [
    ...useCases,
    UserQueryRepo,
    UserRepo,
    AuthRepo,
    ConfirmationRepo,
    LocalStrategy,
    AuthService,
    Email,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
