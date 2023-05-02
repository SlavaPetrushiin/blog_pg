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

const useCases = [SignInUseCase, SignOutUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Security]),
    CqrsModule,
    JwtModule.register({}),
  ],
  providers: [...useCases, UserQueryRepo, AuthRepo, LocalStrategy, AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
