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
      await testService.createAndLoginUser('test');
    });

    afterEach(async () => {
      await testService.deleteTag();
      await testService.deleteSession();
      await testService.deleteUser();
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
      await testService.createTag('test', 'example');
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

  describe('PATCH /api/tags/:tagId', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
      await testService.createTag('test', 'example');
    });

    afterEach(async () => {
      await testService.deleteTag();
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should reject update tag request if request is invalid ', async () => {
      const tag = await testService.getTag('example');
      const response = await request(app.getHttpServer())
        .patch(`/api/tags/${tag.id}`)
        .set('Authorization', 'test')
        .send({
          name: '',
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to update tag', async () => {
      const tag = await testService.getTag('example');
      const response = await request(app.getHttpServer())
        .patch(`/api/tags/${tag.id}`)
        .set('Authorization', 'test')
        .send({
          name: 'updated  tag',
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.name).toBe('updated  tag');
    });

    it('should be able to update tag if tag name is the same with old data', async () => {
      const tag = await testService.getTag('example');
      const response = await request(app.getHttpServer())
        .patch(`/api/tags/${tag.id}`)
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

  describe('DELETE /api/tags/:tagId', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
      await testService.createTag('test', 'example');
    });

    afterEach(async () => {
      await testService.deleteTag();
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should reject request to delete tag if tag is not exist', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/tags/wrong')
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to delete tag', async () => {
      const tag = await testService.getTag('example');
      const response = await request(app.getHttpServer())
        .delete(`/api/tags/${tag.id}`)
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');
    });
  });

  describe('GET /api/tags', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
      for (let i = 0; i < 3; i++) {
        await testService.createTag('test', `example${i}`);
      }
    });

    afterEach(async () => {
      await testService.deleteTag();
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should be able to get all tag', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tags')
        .set('Authorization', 'test');

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);
    });
  });
});
