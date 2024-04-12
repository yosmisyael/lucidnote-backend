import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';

describe('TagController', () => {
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

  describe('POST /api/tags', () => {
    beforeEach(async () => {
      await testService.deleteTag();
      await testService.deleteSession();
      await testService.deleteUser();
      await testService.createAndLoginUser();
    });

    it('should reject request if request is invalid ', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', 'test')
        .send({
          name: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should reject request tag name is already used', async () => {
      await testService.createTag();
      const response = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', 'test')
        .send({
          name: 'example',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to create new tag', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', 'test')
        .send({
          name: 'example',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('example');
    });
  });
});
