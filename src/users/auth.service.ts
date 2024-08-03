import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async register(email: string, full_name: string, password: string) {
    // check if email is already in use
    const users = await this.userService.find(email);
    if (users.length > 0) {
      throw new BadRequestException('Email is already in use');
    }

    // generate salt
    const salt = randomBytes(8).toString('hex');
    // encrypt user password
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = salt + '.' + hash.toString('hex');
    // check if email is already in use & create user
    let user: any;
    user = await this.userService.create(full_name, email, hashedPassword);
    // return a response with a cookie that contains user id
    return user;
  }

  async login(email: string, password: string) {
    // find user by email
    const [user] = await this.userService.find(email);
    // return 404 response when user not found
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // compare stored hash with new generated hash
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // return bad request when passwords did not match
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Bad password!');
    }

    // return user as response
    return user;
  }
}
