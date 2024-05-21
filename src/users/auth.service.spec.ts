import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filtered = users.filter((user) => user.email === email);
        return Promise.resolve(filtered);
      },
      create: (full_name: string, email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          full_name,
          password,
        };
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('create new user with salted and hashed password', async () => {
    const user = await service.register('ali@ali.co', 'Ali Hameed', 'qwe123');

    expect(user.password).not.toEqual('qwe123');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if email is in use', async () => {
    await service.register('allawiat@ali.com', 'ali', '1234qwer');
    await expect(
      service.register('allawiat@ali.com', 'ali', '1234qwer'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws an error if login with email not found', async () => {
    await expect(
      service.login('blablabla@asdlfkj.com', 'blablabla'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws an error if password is bad', async () => {
    await service.register('asdf@ali.com', 'ali', 'laskdjf');

    await expect(service.login('asdf@ali.com', 'lask3r3we')).rejects.toThrow(
      BadRequestException,
    );
  });
});
