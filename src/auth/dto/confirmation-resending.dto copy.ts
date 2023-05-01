import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class ConfirmationResendingDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
