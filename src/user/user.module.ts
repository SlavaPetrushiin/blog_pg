import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './api/user.controller';
import { UserQueryRepo } from './infrastructure/user-query.repository';
import { UserRepo } from './infrastructure/user.repository';
import { User } from './entities/user.entity';
import { CreateUserUseCase } from './application/use-cases/create-user-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BanInfo } from './entities/banInfo.entity';
import { EmailConfirmation } from './entities/emailConfirmation.entity';
import { UpdateBanStatusUserUseCase } from './application/use-cases/update-banStatus-user-use-case';

const useCases = [CreateUserUseCase, UpdateBanStatusUserUseCase];

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BanInfo, EmailConfirmation]),
    CqrsModule,
  ],
  providers: [...useCases, UserService, UserQueryRepo, UserRepo],
  controllers: [UserController],
})
export class UserModule {}
