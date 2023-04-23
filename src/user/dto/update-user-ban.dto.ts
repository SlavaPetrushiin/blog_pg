import { IsBoolean, IsString, MinLength } from 'class-validator';

export class UpdateUserBanDto {
  @IsBoolean()
  isBanned: boolean;

  @MinLength(20)
  @IsString()
  banReason: string;
}
