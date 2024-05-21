import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          full_name: 'Ali',
          email: 'ali@ali.com',
          password: '40lkj3423',
        });
      },
      find: (email: string) => {
        return Promise.resolve([
          { id: 999, email, full_name: 'bla', password: 'bla' },
        ]);
      },
      //   remove: () => {},
      //   update: () => {},
    };

    fakeAuthService = {
      //   register: () => {},
      login: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, full_name: 'ali', password });
      },
    };

    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findOneUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findOneUser('1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findAllUsers returns a list of users with a given email', async () => {
    const users = await controller.findAllUsers('ali@ali.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('ali@ali.com');
  });

  it('when login updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.loginUser(
      {
        email: 'ali@ali.com',
        password: '123456',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
