import { IsString, Length, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(6, 20)
  password: string;

  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;
}
