import { IsString, IsEmail } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
