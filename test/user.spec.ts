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
    afterEach(async () => {
      await testService.deleteSession();
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
      await testService.createUser('test');
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
      await testService.createUser('test');
    });

    afterEach(async () => {
      await testService.deleteSession();
      await testService.deleteUser();
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
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe('GET /api/users/current', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
    });

    afterEach(async () => {
      await testService.deleteSession();
      await testService.deleteUser();
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

  describe('PATCH /api/users/current', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
    });

    afterEach(async () => {
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should reject request if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .send({
          username: '',
        })
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to update username and name', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .send({
          name: 'test updated',
          username: 'test updated',
        })
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test updated');
      expect(response.body.data.name).toBe('test updated');
    });

    it('should be able to update username and name if username and name is same with old data', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .send({
          name: 'test updated',
          username: 'test updated',
        })
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test updated');
      expect(response.body.data.name).toBe('test updated');
    });

    it('should be able to update password', async () => {
      let response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .send({
          password: 'password updated',
        })
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');

      response = await request(app.getHttpServer())
        .post('/api/users/login')
        .send({
          username: 'test',
          password: 'password updated',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe('test');
      expect(response.body.data.name).toBe('test');
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject request if username already exist', async () => {
      await testService.createUser('test2');
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .send({
          username: 'test2',
        })
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should reject request if token is invalid', async () => {
      await testService.createUser('test2');
      const response = await request(app.getHttpServer())
        .patch('/api/users/current')
        .send({
          username: 'test2',
        })
        .set('Authorization', 'wrong');

      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/users/logout', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
    });

    afterEach(async () => {
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should reject request if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/logout')
        .set('Authorization', 'wrong');

      logger.info(response.body);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to logout user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/users/logout')
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');
    });
  });
});
