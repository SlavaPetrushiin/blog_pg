import { IsUUID } from 'class-validator';

export class ConfirmationDto {
  @IsUUID()
  code;
}
