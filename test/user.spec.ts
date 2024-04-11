import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteUser();
    });

    it('should reject request if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          username: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to register new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'test',
          username: 'test',
          password: 'test',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
    });

    it('should reject request if username already exist', async () => {
      await testService.createUser();
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'test',
          username: 'test',
          password: 'test',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      await testService.deleteSession();
      await testService.deleteUser();
      await testService.createUser();
    });

    it('should reject request if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'test',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
    });
  });

  describe('GET /api/users/current', () => {
    beforeEach(async () => {
      await testService.deleteSession();
      await testService.deleteUser();
      await testService.createAndLoginUser();
    });

    it('should reject request if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', 'wrong');

      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to get user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/current')
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
    });
  });
});
