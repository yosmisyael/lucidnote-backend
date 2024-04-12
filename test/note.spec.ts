import { INestApplication } from '@nestjs/common';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';

describe('Note Controller', () => {
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

  describe('POST /api/notes', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
    });

    afterEach(async () => {
      await testService.deleteTag();
      await testService.deleteNote();
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should reject create note request if request body is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', 'test')
        .send({
          title: '',
          body: '',
          tags: [],
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to create a note', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', 'test')
        .send({
          title: 'example',
          body: 'example',
          tags: [],
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
      expect(response.body.data.title).toBe('example');
      expect(response.body.data.body).toBe('example');
    });

    it('should reject create note request if tags field contains invalid tag', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', 'test')
        .send({
          title: 'example',
          body: 'example',
          tags: [
            {
              id: 'wrong',
            },
          ],
        });

      logger.info(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to create a note and attach a tag to it.', async () => {
      await testService.createTag('test', 'example');
      const tag = await testService.getTag('example');
      const response = await request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', 'test')
        .send({
          title: 'example',
          body: 'example',
          tags: [
            {
              id: tag.id,
            },
          ],
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
      expect(response.body.data.title).toBe('example');
      expect(response.body.data.body).toBe('example');
      expect(response.body.data.tags.length).toBe(1);
    });
  });

  describe('GET /api/notes/:noteId', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
      await testService.createNote('test', 'example', '');
    });

    afterEach(async () => {
      await testService.deleteTag();
      await testService.deleteNote();
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should be able to get note', async () => {
      const note = await testService.getNote('example');
      const response = await request(app.getHttpServer())
        .get(`/api/notes/${note.id}`)
        .set('Authorization', 'test');

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(note.id);
      expect(response.body.data.title).toBe(note.title);
      expect(response.body.data.body).toBe(note.body);
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should reject get note request if note does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notes/wrong')
        .set('Authorization', 'test');

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /api/notes/:noteId', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
      await testService.createNote('test', 'example', '');
    });

    afterEach(async () => {
      await testService.deleteTag();
      await testService.deleteNote();
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should reject note update request if request is invalid', async () => {
      const note = await testService.getNote('example');
      const response = await request(app.getHttpServer())
        .patch(`/api/notes/${note.id}`)
        .set('Authorization', 'test')
        .send({
          title: '',
          body: 'updated example note',
        });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should be able to update the note', async () => {
      const note = await testService.getNote('example');
      const response = await request(app.getHttpServer())
        .patch(`/api/notes/${note.id}`)
        .set('Authorization', 'test')
        .send({
          title: 'updated example note',
          body: 'updated example note',
          tags: [],
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(note.id);
      expect(response.body.data.title).toBe('updated example note');
      expect(response.body.data.body).toBe('updated example note');
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should be able to update tag association', async () => {
      for (let i = 1; i < 3; i++) {
        await testService.createTag('test', `example${i}`);
      }
      const firstTag = await testService.getTag('example1');
      await testService.createNote('test', 'example', '');
      const note = await testService.getNote('example');
      expect(note.tags.length).toBe(0);

      const secondTag = await testService.getTag('example2');
      let response = await request(app.getHttpServer())
        .patch(`/api/notes/${note.id}`)
        .set('Authorization', 'test')
        .send({
          title: 'updated example note',
          body: 'updated example note',
          tags: [
            {
              id: firstTag.id,
            },
          ],
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.tags.length).toBe(1);

      response = await request(app.getHttpServer())
        .patch(`/api/notes/${note.id}`)
        .set('Authorization', 'test')
        .send({
          title: 'updated example note',
          body: 'updated example note',
          tags: [
            {
              id: firstTag.id,
            },
            {
              id: secondTag.id,
            },
          ],
        });

      logger.info(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.tags.length).toBe(2);
    });
  });

  describe('DELETE /api/notes/:noteId', () => {
    beforeEach(async () => {
      await testService.createAndLoginUser('test');
      await testService.createNote('test', 'example', '');
    });

    afterEach(async () => {
      await testService.deleteTag();
      await testService.deleteNote();
      await testService.deleteSession();
      await testService.deleteUser();
    });

    it('should be able to delete the note', async () => {
      const note = await testService.getNote('example');
      const response = await request(app.getHttpServer())
        .delete(`/api/notes/${note.id}`)
        .set('Authorization', 'test');

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe('OK');
    });

    it('should reject delete note request if note does not exist', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/notes/wrong')
        .set('Authorization', 'test');

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });
});
