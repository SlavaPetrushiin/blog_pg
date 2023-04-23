import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserBanDto } from '../dto/update-user-ban.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user-use-case';
import { UserRepo } from '../infrastructure/user.repository';
import { UserQueryRepo } from '../infrastructure/user-query.repository';
import { UpdateBanStatusUserCommand } from '../application/use-cases/update-banStatus-user-use-case';

@Controller('sa')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private commandBus: CommandBus,
    private userRepo: UserRepo,
    private userQueryRepo: UserQueryRepo,
  ) {}

  @Get('users')
  findAll() {
    return this.userQueryRepo.findAllUsers();
  }

  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return 'find one user';
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('users')
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('users/:userId/ban')
  update(@Param('userId') userId: string, @Body() dto: UpdateUserBanDto) {
    const isUpdated = this.commandBus.execute(
      new UpdateBanStatusUserCommand(userId, dto),
    );
    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('users/:id')
  async remove(@Param('id') id: string) {
    const isRemoved = await this.userRepo.removeUserById(+id);
    if (!isRemoved) {
      throw new NotFoundException();
    }
    return;
  }
}
