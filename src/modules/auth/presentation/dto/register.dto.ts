import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}