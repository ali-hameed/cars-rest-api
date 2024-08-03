import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('Auth Routes', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const testUser = {
    name: 'Ali Hameed',
    email: 'ali.hameed@ali.co',
    password: '123456',
  };

  it('/users/auth/register (POST)', () => {
    console.log('--------Register--------');
    return request(app.getHttpServer())
      .post('/users/auth/register')
      .send({
        full_name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201)
      .then((res) => {
        const { id, email, full_name } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(testUser.email);
        expect(full_name).toEqual(testUser.name);
      });
  });

  it('can login with the new registered user', () => {
    console.log('--------Login--------');
    return request(app.getHttpServer())
      .post('/users/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)
      .then((res) => {
        const { id, email, full_name } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(testUser.email);
        expect(full_name).toEqual(testUser.name);
      });
  });

  it('can get the current user after login', () => {
    console.log('--------Who Am I--------');
    return request(app.getHttpServer())
      .get('/users/auth/whoami')
      .expect(200)
      .then((res) => {
        const { id, email, full_name } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(testUser.email);
        expect(full_name).toEqual(testUser.name);
      });
  });
});
