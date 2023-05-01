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
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserBanDto } from '../dto/update-user-ban.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user-use-case';
import { UserRepo } from '../infrastructure/user.repository';
import { UserQueryRepo } from '../infrastructure/user-query.repository';
import { UpdateBanStatusUserCommand } from '../application/use-cases/update-banStatus-user-use-case';
import { AllEntitiesUser } from '../dto/allEntitiesUser.dto';

@Controller('sa')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private commandBus: CommandBus,
    private userRepo: UserRepo,
    private userQueryRepo: UserQueryRepo,
  ) {}

  @Get('users')
  findAll(@Query() allEntitiesUser: AllEntitiesUser) {
    return this.userQueryRepo.findAllUsers(allEntitiesUser);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('users')
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('users/:userId/ban')
  async update(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateUserBanDto,
  ) {
    const foundUser = await this.userQueryRepo.findUserById(userId);

    if (!foundUser) {
      throw new NotFoundException();
    }

    const isUpdated = await this.commandBus.execute(
      new UpdateBanStatusUserCommand(userId, dto),
    );

    if (!isUpdated) {
      throw new NotFoundException();
    }

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
