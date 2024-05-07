import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  full_name: string;

  @Expose()
  email: string;
}
