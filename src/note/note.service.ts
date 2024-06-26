import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Prisma, User } from '@prisma/client';
import {
  CreateNoteRequest,
  NoteResponse,
  SearchNoteRequest,
  UpdateNoteRequest,
} from '../model/note.model';
import { ValidationService } from '../common/validation.service';
import { NoteValidation } from './note.validation';
import { WebResponse } from '../model/web.model';

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

  async update(user: User, request: UpdateNoteRequest): Promise<NoteResponse> {
    this.logger.info(`[NOTE UPDATE]: ${JSON.stringify(request)}`);
    const updateRequest: UpdateNoteRequest = this.validationService.validate(
      NoteValidation.UPDATE,
      request,
    );
    const isNoteAvailable: NoteResponse = await this.get(
      user,
      updateRequest.id,
    );

    const existingTagIdsArr = isNoteAvailable.tags!.map(({ id }) => id);
    const requestedTagIds: Set<string> = new Set(
      updateRequest.tags.map(({ id }) => id),
    );

    const tagsToDisconnect: { id: string }[] = existingTagIdsArr
      .filter((id) => !requestedTagIds.has(id))
      .map((id) => ({ id }));

    const note = await this.prismaService.note.update({
      where: {
        id: updateRequest.id,
        userId: user.id,
      },
      data: {
        title: updateRequest.title,
        body: updateRequest.body,
        tags: {
          disconnect: tagsToDisconnect,
          connect: updateRequest.tags,
        },
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

  async remove(user: User, noteId: string): Promise<boolean> {
    await this.get(user, noteId);

    await this.prismaService.note.delete({
      where: {
        userId: user.id,
        id: noteId,
      },
    });

    return true;
  }

  async search(
    user: User,
    request: SearchNoteRequest,
  ): Promise<WebResponse<NoteResponse[]>> {
    const searchRequest: SearchNoteRequest = this.validationService.validate(
      NoteValidation.SEARCH,
      request,
    );
    const skip: number = (searchRequest.page - 1) * searchRequest.size;

    const filters: Prisma.NoteWhereInput[] = [];

    if (searchRequest.title) {
      filters.push({
        OR: [
          {
            title: {
              equals: searchRequest.title,
            },
          },
          {
            title: {
              contains: searchRequest.title,
            },
          },
        ],
      });
    }

    if (searchRequest.tags && searchRequest.tags.length > 0) {
      const requestTag = searchRequest.tags.map((id) => ({ id }));
      await this.verifyTag(user.id, requestTag);
      filters.push({
        tags: {
          some: {
            id: {
              in: searchRequest.tags,
            },
          },
        },
      });
    }

    const notes = await this.prismaService.note.findMany({
      where: {
        userId: user.id,
        AND: filters,
      },
      take: searchRequest.size,
      skip: skip,
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const countNotes = await this.prismaService.note.count({
      where: {
        userId: user.id,
        AND: filters,
      },
    });

    return {
      data: notes.map((note) => ({
        id: note.id,
        title: note.title,
        body: note.body,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        tags: note.tags,
      })),
      paging: {
        currentPage: searchRequest.page,
        totalPage: Math.ceil(countNotes / searchRequest.size),
        size: searchRequest.size,
      },
    };
  }
}
