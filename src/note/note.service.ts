import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { User } from '@prisma/client';
import { CreateNoteRequest, NoteResponse } from '../model/note.model';
import { ValidationService } from '../common/validation.service';
import { NoteValidation } from './note.validation';

@Injectable()
export class NoteService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async verifyTag(userId: string, tags: { id: string }[]): Promise<void> {
    const tagIds = tags.map(({ id }) => id);
    const result = await this.prismaService.tag.findMany({
      where: {
        id: {
          in: tagIds,
        },
        userId: userId,
      },
    });

    if (result.length < tagIds.length) {
      throw new HttpException('Tags must be valid.', 400);
    }
  }

  async create(user: User, request: CreateNoteRequest): Promise<NoteResponse> {
    this.logger.info(`[NOTE CREATE]: ${JSON.stringify(request)}`);
    const createRequest: CreateNoteRequest = this.validationService.validate(
      NoteValidation.CREATE,
      request,
    );
    await this.verifyTag(user.id, createRequest.tags);

    const note = await this.prismaService.note.create({
      data: {
        title: createRequest.title,
        body: createRequest.body,
        tags: {
          connect: createRequest.tags,
        },
        userId: user.id,
      },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: note.id,
      title: note.title,
      body: note.body,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      tags: note.tags,
    };
  }

  async get(user: User, noteId: string): Promise<NoteResponse> {
    const note = await this.prismaService.note.findUnique({
      where: {
        id: noteId,
        userId: user.id,
      },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!note) {
      throw new HttpException('Note does not exist.', 404);
    }

    return {
      id: note.id,
      title: note.title,
      body: note.body,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      tags: note.tags,
    };
  }
}
